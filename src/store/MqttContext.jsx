import React, { createContext, useContext, useEffect, useState } from "react";
import mqtt from "mqtt";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

const MqttContext = createContext();

export const MqttProvider = ({ children }) => {
  // const [client, setClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [eventLogs, setEventLogs] = useState([]);
  const [passedMessage, setPassedMessage] = useState(null);

  const [data, setData] = useState(() => {
    return {
      "123/rnd": [],
    };
  });

  useEffect(() => {
    const mqttClient = mqtt.connect({
      hostname: "mqttbroker.bc-pl.com",
      port: 443,
      protocol: "wss",
      path: "/mqtt",
      username: "mqttuser",
      password: "Bfl@2025",
      clientId: `mqtt_${Math.random().toString(16).slice(4)}`,
      reconnectPeriod: 5000,
    });

    const handleStatusChange = (newStatus) => {
      if (connectionStatus !== newStatus) {
        setConnectionStatus(newStatus);
        console.log(`MQTT: ${newStatus}`);
      }
    };

    mqttClient.on("connect", () => {
      handleStatusChange("connected");
      mqttClient.subscribe([
        "123/gear",
        // "pomon/rnd/status"
      ]);
    });

    mqttClient.on("reconnect", () => {
      handleStatusChange("reconnecting");
    });

    mqttClient.on("offline", () => {
      handleStatusChange("disconnected");
    });

    mqttClient.on("error", (err) => {
      // console.error("MQTT error:", err);
      // handleStatusChange("error");
    });

    mqttClient.on("message", async (topic, message) => {
      const messageStr = message.toString();
      console.log(`📩 ${topic}:`, messageStr);

      // Split multi-line messages (if both devices are in one message)
      const lines = messageStr.split('\n').map(line => line.trim()).filter(line => line.length > 0);

      const newMessages = lines.map(line => ({
        time: new Date().toISOString(),
        value: line,
      }));

      setData((prevData) => {
        const existing = prevData[topic] || [];
        const updatedData = {
          ...prevData,
          [topic]: [...existing, ...newMessages].slice(-4),
        };
        return updatedData;
      });

      if (topic === "123/gear") {
        try {
          await axios.post(`${apiUrl}/gear_value_view/`, {
            "value": messageStr,
          });
          console.log("✅ Sent gear message to API");
        } catch (err) {
          console.error("❌ Failed to send gear message to API:", err);
        }
      }

      lines.forEach((line) => {
        // if (topic === "pomon/rnd/status" && allowedLogs.some(msg => line.includes(msg))) {
        if (topic === "123/gear" && allowedLogs.some(msg => line.includes(msg))) {
          setEventLogs(prev => [...prev, { time: new Date().toISOString(), message: line }]);
        }
      });
    });

    // setClient(mqttClient);

    return () => {
      mqttClient.end();
      handleStatusChange("disconnected");
    };
  }, []);

  return (
    <MqttContext.Provider
      value={{ data, connectionStatus, eventLogs, passedMessage }}
    >
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => useContext(MqttContext);