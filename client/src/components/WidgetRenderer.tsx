import { useState, useRef, useEffect } from "react";
import { Copy, Check, Eye, EyeOff } from "lucide-react";

interface WidgetRendererProps {
  widgetHtml: string;
  widgetTitle?: string;
  widgetUri?: string;
}

const WidgetRenderer = ({
  widgetHtml,
  widgetTitle,
  widgetUri,
}: WidgetRendererProps) => {
  const [copied, setCopied] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Scroll to widget when it appears
  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [widgetHtml]);

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(widgetHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy HTML:", err);
    }
  };

  // Adjust iframe height to content
  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow?.document?.body) {
        const body = iframe.contentWindow.document.body;
        const html = iframe.contentWindow.document.documentElement;
        const height = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight,
        );
        setIframeHeight(Math.max(height, 200)); // Minimum 200px
      }
    } catch (err) {
      // Cross-origin access denied, keep default height
      console.debug("Cannot access iframe content for height adjustment:", err);
    }
  };

  return (
    <div
      ref={containerRef}
      className="mb-4 transition-all duration-500 ease-in-out"
    >
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-semibold text-sm flex items-center gap-2">
          <span className="text-blue-600 dark:text-blue-400">
            🎨 Widget Preview
          </span>
          {widgetTitle && (
            <span className="text-gray-600 dark:text-gray-400 font-normal">
              ({widgetTitle})
            </span>
          )}
        </h5>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHtml(!showHtml)}
            className="px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1"
          >
            {showHtml ? (
              <>
                <EyeOff size={14} />
                Hide HTML
              </>
            ) : (
              <>
                <Eye size={14} />
                Show HTML
              </>
            )}
          </button>
          <button
            onClick={handleCopyHtml}
            className="px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy HTML
              </>
            )}
          </button>
        </div>
      </div>

      {widgetUri && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          URI:{" "}
          <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
            {widgetUri}
          </code>
        </div>
      )}

      {showHtml && (
        <div className="mb-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
          <pre className="text-xs overflow-x-auto">
            <code>{widgetHtml}</code>
          </pre>
        </div>
      )}

      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white shadow-lg">
        <iframe
          ref={iframeRef}
          srcDoc={widgetHtml}
          onLoad={handleIframeLoad}
          className="w-full border-0 transition-all duration-300"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
          allow="cross-origin-isolated"
          title={widgetTitle || "Widget Preview"}
          style={{
            height: `${iframeHeight}px`,
            colorScheme: "normal",
          }}
        />
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="font-semibold">Note:</span> Widget is rendered in a
        sandboxed iframe for security.
      </div>
    </div>
  );
};

export default WidgetRenderer;
