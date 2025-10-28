import "../styles/globals.css";
import { Toaster } from "react-hot-toast"; 

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      {/* ✅ Toast Notification Container */}
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}
