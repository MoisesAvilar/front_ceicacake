import { useEffect, useState } from "react";

export const Greeting = () => {
  const [showGreeting, setShowGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    let greeting;

    if (hour >= 5 && hour < 12) {
      greeting = "Bom dia ☀️ bem-vinda, Ceiça";
    } else if (hour >= 12 && hour < 18) {
      greeting = "Boa tarde 🌞 bem-vinda, Ceiça";
    } else {
      greeting = "Boa noite 🌙 bem-vinda, Ceiça";
    }

    setShowGreeting(greeting);
    const timer = setTimeout(() => {
      setShowGreeting("");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return showGreeting;
};
