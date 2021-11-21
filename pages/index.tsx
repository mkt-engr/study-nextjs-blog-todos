import Auth from "../components/Auth";
import Layout from "../components/Layout";

const Home: React.FC = () => {
  return (
    <Layout title="Login">
      <Auth />
    </Layout>
  );
};

export default Home;
