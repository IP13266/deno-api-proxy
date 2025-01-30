declare namespace Deno {
  function serve(handler: (request: Request) => Promise<Response>): void;
}

// 代理服务器的主要处理函数
async function handleRequest(request: Request): Promise<Response> {
  // 解析请求的URL
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 如果请求的是根目录或index.html，则返回代理服务运行状态信息
  if (pathname === '/' || pathname === '/index.html') {
    return new Response('Proxy is Running！Details：https://github.com/tech-shrimp/deno-api-proxy', {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  } 

  // 只处理支持的API路径
  let targetUrl: string | null = null;
  if (pathname.startsWith('/openai')) {
    targetUrl = `https://api.openai.com${pathname}`;
  } else if (pathname.startsWith('/claude')) {
    targetUrl = `https://api.claude.com${pathname}`;
  } else if (pathname.startsWith('/groq')) {
    targetUrl = `https://api.groq.com${pathname}`;
  } else if (pathname.startsWith('/openrouter.ai')) {
    targetUrl = `https://api.openrouter.ai${pathname}`;
  }

  // 如果不是支持的API路径，返回404
  if (!targetUrl) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    // 创建新的Headers对象，并设置允许通过的头部信息
    const headers = new Headers();
    const allowedHeaders = ['accept', 'content-type', 'authorization'];
    for (const [key, value] of request.headers.entries()) {
      if (allowedHeaders.includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    }

    // 使用fetch函数向目标URL发送请求
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.body
    });

    // 创建新的Headers对象，并设置响应头信息
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Referrer-Policy', 'no-referrer');

    // 返回代理后的响应
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (error) {
    // 如果请求失败，则记录错误并返回500内部服务器错误
    console.error('Failed to fetch:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// 启动Deno服务器
Deno.serve(handleRequest);
