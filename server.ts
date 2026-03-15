import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Agent Simulation Data
  const brands = Array.from({ length: 58 }, (_, i) => ({
    id: `brand-${i + 1}`,
    name: `Brand ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    profit: Math.floor(Math.random() * 5000) - 1000,
    burn: Math.floor(Math.random() * 2000),
    velocity: Math.random(),
    status: Math.random() > 0.8 ? "INCUBATING" : "ACTIVE",
    orders: Math.floor(Math.random() * 1000),
  }));

  // Event Bus Logic
  io.on("connection", (socket) => {
    console.log("Client connected to Event Bus");
    
    // Send initial state immediately
    socket.emit("metrics_update", brands);

    // Simulate Agent Communication
    const interval = setInterval(() => {
      const randomBrand = brands[Math.floor(Math.random() * brands.length)];
      
      // Weighted random event selection
      const eventRoll = Math.random();
      let event;

      if (eventRoll > 0.95) {
        // High impact event
        event = { agent: "CEOAgent", type: "BUDGET_REALLOCATED", payload: { from: "System_Reserve", to: randomBrand.id, amount: 1000 } };
        randomBrand.burn += 1000;
      } else if (eventRoll > 0.8) {
        // Marketing event
        event = { agent: "MarketingAgent", type: "CAMPAIGN_OPTIMIZED", payload: { brandId: randomBrand.id, platform: "Meta", roas: (Math.random() * 4 + 2).toFixed(2) } };
        randomBrand.velocity = Math.min(1, randomBrand.velocity + 0.05);
      } else if (eventRoll > 0.6) {
        // Pricing event
        const oldPrice = (Math.random() * 100).toFixed(2);
        const newPrice = (parseFloat(oldPrice) * (1 + (Math.random() * 0.2 - 0.1))).toFixed(2);
        event = { agent: "PricingAgent", type: "PRICE_ADJUSTED", payload: { brandId: randomBrand.id, oldPrice, newPrice } };
      } else if (eventRoll > 0.4) {
        // Traffic Engine event
        const platforms = ["TikTok", "Instagram", "YouTube"];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const hooks = ["Problem", "Shock", "Curiosity", "POV"];
        const hook = hooks[Math.floor(Math.random() * hooks.length)];
        
        event = { 
          agent: "TrafficAgent", 
          type: "VIDEO_POSTED", 
          payload: { 
            brandId: randomBrand.id, 
            platform, 
            hook,
            views: Math.floor(Math.random() * 5000) + 1000,
            ctr: (Math.random() * 0.05 + 0.01).toFixed(3)
          } 
        };
        randomBrand.orders += Math.random() > 0.7 ? 1 : 0;
      } else {
        // Standard operational event
        event = { agent: "TrendAgent", type: "VELOCITY_SYNC", payload: { brandId: randomBrand.id, delta: (Math.random() * 0.1 - 0.05).toFixed(3) } };
        randomBrand.velocity = Math.max(0, Math.min(1, randomBrand.velocity + (Math.random() * 0.02 - 0.01)));
      }

      socket.emit("agent_event", {
        ...event,
        timestamp: new Date().toISOString(),
      });

      // Update metrics based on velocity
      randomBrand.profit += Math.floor(randomBrand.velocity * 50) - 10;
      randomBrand.orders += Math.random() > 0.5 ? 1 : 0;
      
      // Incubator Logic
      if (randomBrand.orders > 500 && randomBrand.status !== "INCUBATING") {
        randomBrand.status = "INCUBATING";
        socket.emit("agent_event", {
          agent: "CEOAgent",
          type: "INCUBATOR_TRIGGERED",
          payload: { brandId: randomBrand.id, reason: "Order threshold reached (500/mo)" },
          timestamp: new Date().toISOString(),
        });
      }

      socket.emit("metrics_update", brands);
    }, 1500);

    socket.on("disconnect", () => clearInterval(interval));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
