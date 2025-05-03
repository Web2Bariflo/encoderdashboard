import React, { createContext, useContext, useEffect, useState } from "react";
import mqtt from "mqtt";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const MqttContext = createContext();

export const MqttProvider = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [eventLogs, setEventLogs] = useState([]);
  const [passedMessage, setPassedMessage] = useState(null);

  const allowedLogs = [
    "Activated",
    "Deactivated",
    "New R&D event scheduled",
  ];

  const [data, setData] = useState(() => ({
    "factory/gearbox1/input/rpm": [],
    "factory/gearbox1/out1/rpm": [],
    "factory/gearbox1/out2/rpm": [],
    "factory/gearbox1/out3/rpm": [],
    "factory/gearbox1/out4/rpm": [],
  }));

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
      setConnectionStatus(newStatus);
      console.log(`MQTT: ${newStatus}`);
    };

    mqttClient.on("connect", () => {
      handleStatusChange("connected");
      console.log("✅ Connected to MQTT Broker");

      mqttClient.subscribe(
        [
          "factory/gearbox1/input/rpm",
          "factory/gearbox1/out1/rpm",
          "factory/gearbox1/out2/rpm",
          "factory/gearbox1/out3/rpm",
          "factory/gearbox1/out4/rpm",
        ],
        (err) => {
          if (err) {
            console.error("❌ Failed to subscribe:", err);
          } else {
            console.log("✅ Subscribed to topics");
          }
        }
      );
    });

    mqttClient.on("reconnect", () => {
      handleStatusChange("reconnecting");
      console.log("🔄 Reconnecting...");
    });

    mqttClient.on("offline", () => {
      handleStatusChange("disconnected");
      console.log("❌ Disconnected from MQTT Broker");
    });

    mqttClient.on("error", (err) => {
      console.error("❌ MQTT error:", err);
      handleStatusChange("error");
    });

    mqttClient.on("message", async (topic, message) => {
      const raw = message.toString().trim();
      console.log(`📩 Topic: ${topic} | Message: ${raw}`);

      const lines = raw
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const newMessages = lines.map((line) => ({
        time: new Date().toISOString(),
        value: parseFloat(line), // directly convert to number
      }));

      setData((prevData) => {
        const existing = prevData[topic] || [];
        return {
          ...prevData,
          [topic]: [...existing, ...newMessages].slice(-5),
        };
      });

      if (topic.startsWith("factory/gearbox1/")) {
        try {
          await axios.post(`${apiUrl}/gear_value_view/`, {
            value: `${topic} | ${raw}`,
          });
          console.log("✅ Sent publish message to API");
        } catch (err) {
          console.error("❌ Failed to send to API:", err);
        }
      }

      lines.forEach((line) => {
        if (
          topic.startsWith("factory/gearbox1/") &&
          allowedLogs.some((msg) => line.includes(msg))
        ) {
          setEventLogs((prev) => [
            ...prev,
            { time: new Date().toISOString(), message: line },
          ]);
        }
      });
    });

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
