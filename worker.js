// Cloudflare Worker - 新浪财经API CORS代理
// 部署方法：https://workers.cloudflare.com/ -> 创建Worker -> 粘贴此代码 -> 部署
// 然后把下面的 WORKER_URL 替换为你的Worker地址

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // 允许的域名白名单
    const ALLOWED_HOSTS = [
      'money.finance.sina.com.cn',
      'hq.sinajs.cn',
      'vip.stock.finance.sina.com.cn'
    ];
    
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      return new Response(JSON.stringify({error: 'missing url param'}), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 安全校验
    try {
      const target = new URL(targetUrl);
      if (!ALLOWED_HOSTS.includes(target.hostname)) {
        return new Response(JSON.stringify({error: 'host not allowed'}), {
          status: 403,
          headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({error: 'invalid url'}), {
        status: 400,
        headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
      });
    }
    
    // 转发请求
    const resp = await fetch(targetUrl, {
      headers: {
        'Referer': 'https://finance.sina.com.cn',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // 添加CORS头返回
    const newHeaders = new Headers(resp.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', '*');
    
    return new Response(resp.body, {
      status: resp.status,
      headers: newHeaders
    });
  }
};