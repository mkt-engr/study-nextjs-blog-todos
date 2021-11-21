import Head from "next/head";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title: string;
};
const Layout: React.FC<Props> = ({ children, title = "Default title" }) => {
  return (
    <div className="flex justify-center items-center flex-col min-h-screen text-white font-mono bg-gray-800">
      <Head>
        <title>{title}</title>
      </Head>
      <main className="flex flex-1 justify-center items-center w-screen flex-col">
        {children}
      </main>
      <footer className="w-full h-6 flex justify-center items-center text-gray-500 text-sm">
        @Makito Mori 2021
      </footer>
    </div>
  );
};

export default Layout;
