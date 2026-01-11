import { useEffect, useState } from "react";
import type { GameOfLifeModule } from "../GameOfLifeModule";

export const useGameOfLifeModule = () => {
  const [module, setModule] = useState<GameOfLifeModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let script: HTMLScriptElement;
    let mounted = true;

    const loadModule = async () => {
      try {
        if (window.GameOfLifeModule) {
          const Module = await window.GameOfLifeModule();
          if (mounted) {
            setModule(Module);
            setLoading(false);
          }
          return;
        }

        // create <script> tag to load js file
        script = document.createElement("script");
        script.src = "/GameOfLifeModule.js";
        script.async = true;

        script.onload = async () => {
          try {
            if (window.GameOfLifeModule && mounted) {
              // initializes WebAssembly, returns module object
              const Module = await window.GameOfLifeModule();
              setModule(Module);
              setLoading(false);
            }
          } catch (err) {
            console.error(err);
            if (mounted) {
              setError("Failed to initialize module");
              setLoading(false);
            }
          }
        };

        script.onerror = () => {
          if (mounted) {
            setError("Failed to load script");
            setLoading(false);
          }
        };

        // attach script to dom
        document.body.appendChild(script);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError("Failed to load module");
          setLoading(false);
        }
      }
    };

    loadModule();

    // cleanup for unmount
    return () => {
      mounted = false;
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return { module, loading, error };
};
