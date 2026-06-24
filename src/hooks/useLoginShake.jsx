const useLoginShake = () => {
  const shakeIt = (loginBoxId) => {
    const loginBox = document.getElementById(loginBoxId);

    if (loginBox) {
      loginBox.classList.add('shake');
      loginBox.querySelectorAll('input').forEach(inputField => inputField.style.borderColor = 'red');

      setTimeout(() => {
        loginBox.classList.remove('shake');
        loginBox.querySelectorAll('input').forEach(inputField => inputField.style.borderColor = '#ccc')
      }, 1000);
    }
  };

  return shakeIt;
}

export default useLoginShake;
