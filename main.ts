/// <reference types="https://deno.land/x/deno/types/global.d.ts" />

// 代理服务器的主要处理函数
async function handleRequest(request: Request): Promise<Response> {
  // 解析请求的URL
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 如果请求的是根目录或index.html，则返回代理服务运行状态信息
  if (pathname === '/' || pathname === '/index.html') {
    return new Response('Proxy is Running！Details：https://github.com/IP13266/deno-api-proxy', {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  } 

  // 根据不同的API地址进行不同的处理
  let targetUrl: string;
  if (pathname.startsWith('/openai')) {
    // 设置目标URL，即需要代理的Open AI API地址
    targetUrl = `https://api.openai.com${pathname}`;
  } else if (pathname.startsWith('/claude')) {
    // 设置目标URL，即需要代理的Claude API地址
    targetUrl = `https://api.claude.com${pathname}`;
  } else if (pathname.startsWith('/groq')) {
    // 设置目标URL，即需要代理的Groq API地址
    targetUrl = `https://api.groq.com${pathname}`;
  } else if (pathname.startsWith('/openrouter.ai')) {
    // 设置目标URL，即需要代理的openrouter.ai API地址
    targetUrl = `https://api.openrouter.ai${pathname}`;
  } else {
    // 其他API地址的处理
    targetUrl = `https://${pathname}`;
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
