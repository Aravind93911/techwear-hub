function adminLogin(e) {
  e.preventDefault();
  const user = document.getElementById('adminUser').value;
  const pass = document.getElementById('adminPass').value;

  if (user === 'admin' && pass === 'admin123') {
    document.getElementById('adminLoginSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    alert('Welcome Admin!');
    generateLog();
  } else {
    alert('Access denied!');
  }
}
