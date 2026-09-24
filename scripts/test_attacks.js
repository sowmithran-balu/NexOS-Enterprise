async function runTests() {
  console.log('=== NexOS Defense-in-Depth Automated Security Verification ===\n');

  // Test 1: SQL Injection
  console.log('[1/4] Executing SQL Injection (SQLi) Probe...');
  const sqliRes = await fetch('http://localhost:8080/api/auth/login?probe=1%20UNION%20SELECT%20password%20FROM%20users--', {
    headers: { 'X-Simulate-Attacker-IP': '198.51.100.71' }
  });
  const sqliData = await sqliRes.json();
  console.log(`      -> HTTP ${sqliRes.status}: ${sqliData.error} | Signature: ${sqliData.message}\n`);

  // Test 2: Cross-Site Scripting (XSS)
  console.log('[2/4] Executing Cross-Site Scripting (XSS) Probe...');
  const xssRes = await fetch('http://localhost:8080/api/auth/login?search=%3Cscript%3Ealert(document.cookie)%3C/script%3E', {
    headers: { 'X-Simulate-Attacker-IP': '198.51.100.72' }
  });
  const xssData = await xssRes.json();
  console.log(`      -> HTTP ${xssRes.status}: ${xssData.error} | Signature: ${xssData.message}\n`);

  // Test 3: Brute-Force & Token Bucket Rate Limiting Flood
  console.log('[3/4] Firing 6 rapid requests from probe IP 203.0.113.88 (Limit = 5/min)...');
  for (let i = 1; i <= 6; i++) {
    const res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Simulate-Attacker-IP': '203.0.113.88'
      },
      body: JSON.stringify({ username: 'admin', password: 'bad_password_guess' })
    });
    const rem = res.headers.get('x-ratelimit-remaining');
    const retry = res.headers.get('retry-after');
    const text = await res.text();
    console.log(`      -> Attempt ${i}: HTTP ${res.status} | Remaining Tokens: ${rem} | Retry-After: ${retry || 'N/A'}`);
  }

  // Test 4: Verify Live Metrics & Auto-Bans
  console.log('\n[4/4] Verifying Live Firewall Status & Auto-Bans...');
  const statusRes = await fetch('http://localhost:8080/api/security/firewall/status');
  const status = await statusRes.json();
  console.log('      -> Total Requests Analyzed :', status.totalRequestsAnalyzed);
  console.log('      -> Threats Neutralized     :', status.blockedRequestsCount);
  console.log('      -> WAF Injections Caught   :', status.wafThreatsCount);
  console.log('      -> Rate Limit Throttles    :', status.rateLimitDropsCount);
  console.log('      -> Active IP Bans Count    :', status.activeBansCount);

  const bansRes = await fetch('http://localhost:8080/api/security/firewall/bans');
  const bans = await bansRes.json();
  console.log('\n=== Currently Active Blacklist Entries ===');
  console.dir(bans, { depth: null });
}

runTests().catch(console.error);
