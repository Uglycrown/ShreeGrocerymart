
import { NextResponse } from 'next/server';

declare const global: any;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const searchResults = await global.google_web_search({
        query: `${query} product image`,
    });

    if (searchResults && searchResults.length > 0 && searchResults[0].image) {
        return NextResponse.json({ imageUrl: searchResults[0].image });
    } else {
        return NextResponse.json({ imageUrl: `https://source.unsplash.com/400x400/?${encodeURIComponent(query)}` });
    }
  } catch (error) {
    console.error('Error in image search API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
