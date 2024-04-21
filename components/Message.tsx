import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import DateTime from "@/lib/dateTime";

interface Props {
  value: string | any;
  type?: "success" | "error" | "info";
}

const getToastStyle = (type: string) => {
  switch (type) {
    case "success":
      return {
        color: "green",
      };
    case "error":
      return {
        color: "red",
      };
    case "info":
    default:
      return {
        color: "white",
      };
  }
};

const Message = ({ value, type = "info" }: Props) => {
  const [alert, setAlert] = useState(true);
  const lastToast = useRef({ message: "", type: "" });

  useEffect(() => {
    if (
      value !== lastToast.current.message ||
      type !== lastToast.current.type
    ) {
      toast.message(value, {
        description: DateTime().format("ddd D MMM YYYY HH:mm:ss"),
        action: {
          label: "Close",
          onClick: () => {},
        },
        style: getToastStyle(type),
      });

      // Update the lastToast ref with the current toast message and type
      lastToast.current.message = value;
      lastToast.current.type = type;

      // Reset the alert state to true to potentially allow for future toasts
      setAlert(true);

      // Set a timer to reset the alert state after the toast is considered "old"
      const timeId = setTimeout(() => {
        setAlert(false);
      }, 10000);

      return () => {
        clearTimeout(timeId);
      };
    }
    // Depend on `value`, `type`, and `alert` to re-trigger the toast if any of these change
  }, [value, type, alert]);

  // The component itself does not render anything visible; the toast is handled through `sonner`
  return null;
};

export default Message;
