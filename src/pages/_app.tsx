import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isDashboard = router.pathname === '/dashboard' || router.pathname.startsWith('/dashboard/');

  return (
    <>
      {!isDashboard && <Navbar />}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
