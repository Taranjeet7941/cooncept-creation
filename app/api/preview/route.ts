import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    // Get userId from query parameters, default to 'default'
    const userId = req.nextUrl.searchParams.get('userId') || 'default';
    const filePath = path.join(process.cwd(), "chat-knowledge", `preview_${userId}.html`);

    if (!fs.existsSync(filePath)) {
        return new NextResponse('No preview available yet. Chat with AI to create one!', {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return new NextResponse(content, {
        headers: { 'Content-Type': 'text/html' }
    });
}
