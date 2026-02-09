import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const AGENT_SERVER_URL = process.env.AGENT_SERVER_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
    try {
        const { prompt, streaming = true } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Proxy the request to the standalone agent server
        const response = await fetch(`${AGENT_SERVER_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, streaming }),
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json({ error: error.error || 'Agent server error' }, { status: response.status });
        }

        if (streaming) {
            // Stream the response from the agent server
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        const reader = response.body?.getReader();
                        if (!reader) {
                            controller.close();
                            return;
                        }

                        const decoder = new TextDecoder();
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            const chunk = decoder.decode(value, { stream: true });
                            controller.enqueue(encoder.encode(chunk));
                        }
                        controller.close();
                    } catch (error) {
                        console.error('Stream Error:', error);
                        controller.error(error);
                    }
                },
            });

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        } else {
            const data = await response.json();
            return NextResponse.json(data);
        }
    } catch (error: any) {
        console.error('API Route Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
