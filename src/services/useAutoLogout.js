import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useAutoLogout = () => {
  const [countdown, setCountdown] = useState(180); // 180 seconds countdown (3 minutes)
  const navigate = useNavigate();

  // Helper function to get all cookies
  const getAllCookies = () => {
    const cookies = document.cookie.split(';');
    const cookieList = cookies.map(cookie => cookie.trim().split('=')[0]);
    return cookieList;
  };

  // Helper function to delete a specific cookie
  const deleteCookie = (cookieName) => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  // Function to log out and delete all cookies
  const handleLogout = () => {
    const allCookies = getAllCookies();
    allCookies.forEach(deleteCookie); // Delete all cookies
    navigate('/login'); // Redirect to login page
  };

  useEffect(() => {
    let timer;
    let countdownTimer;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      if (countdownTimer) clearInterval(countdownTimer);

      // Reset the countdown
      setCountdown(180); // 3 minutes

      // Start a countdown that updates every second
      countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            handleLogout(); // When countdown reaches 0, log out and delete cookies
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Set timeout to trigger logout after 3 minutes
      timer = setTimeout(() => {
        handleLogout(); // Log out and delete cookies after 3 minutes of inactivity
      }, 180000); // 3 minutes of inactivity (180,000 ms)
    };

    // Event listeners to detect user activity
    const activityEvents = ['mousemove', 'keypress', 'touchstart', 'touchmove'];
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer));

    // Initial call to start the timer
    resetTimer();

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [navigate]);

  return countdown; // Return countdown to display it in the component
};

export default useAutoLogout;
