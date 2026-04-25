
app.post('/approve', (req, res) => {
  fs.writeFileSync(path.join(BASE, 'APPROVED'), new Date().toISOString());
  res.send('approved');
});

app.post('/block', (req, res) => {
  fs.writeFileSync(path.join(BASE, 'BLOCKED'), new Date().toISOString());
  res.send('blocked');
});
