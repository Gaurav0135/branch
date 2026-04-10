import { useEffect } from "react";
import API from "./api/axios";
import AppRoutes from "./routes/AppRoutes";

function App() {
  useEffect(() => {
    const warmAndPrefetch = async () => {
      await Promise.allSettled([
        API.get("/health"),
        API.get("/services"),
        API.get("/categories"),
        API.get("/images"),
      ]);
    };

    void warmAndPrefetch();
  }, []);

  return <AppRoutes />;
}

export default App;