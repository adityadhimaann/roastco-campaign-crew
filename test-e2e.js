async function run() {
  const res1 = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: "Re-engage customers who haven't ordered in 60 days. Offer 15% off. Use email." }]
    })
  });
  const data1 = await res1.json();
  console.log("Data 1:", JSON.stringify(data1, null, 2));
}
run().catch(console.error);
