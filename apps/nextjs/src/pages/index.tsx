import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { useEffect, useState } from 'react'
import type { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "@acme/api";
import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getAuth } from "@clerk/nextjs/server";
import { type GetServerSideProps } from 'next';
import { setToken } from '../utils/trpc'

const PostCard: React.FC<{
  post: inferProcedureOutput<AppRouter["post"]["all"]>[number];
}> = ({ post }) => {
  return (
    <div className="max-w-2xl rounded-lg border-2 border-gray-500 p-4 transition-all hover:scale-[101%]">
      <h2 className="text-2xl font-bold text-[hsl(280,100%,70%)]">
        {post.title}
      </h2>
      <p>{post.content}</p>
    </div>
  );
};
type PostType = {
  id: string,
  title: string,
  content: string
}

const Home: NextPage = () => {
  //const postQuery = trpc.post.all.useQuery();
  const {getToken} = useAuth();
  
  const postQuery = trpc.post.all.useMutation();
  const [data, setData] = useState<PostType[]>([])
  useEffect( () => {
    const grabToken = async () => {
      const token = await getToken()
      setToken(token || "")
    }
    grabToken()
      .catch(console.error)
    postQuery.mutate(undefined, {
      onSuccess: (result) => {
        setData(result)
      }
    })
  },[])

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> Turbo
          </h1>
          <AuthShowcase />

          <div className="flex h-[60vh] justify-center overflow-y-scroll px-4 text-2xl">
            {/* {postQuery.data ? ( */}
            {data ? (
              <div className="flex flex-col gap-4">
                {data?.map((p) => {
                  return <PostCard key={p.id} post={p} />;
                })}
              </div>
            ) : (
              <p>Loading..</p>
            )}
          </div>
          {/* <div>
            <h1>New post</h1>
            Post title:
            <input />
            Post contents:
            <input />
            <button>Submit</button>
          </div> */}
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery(
    undefined,
    { enabled: !!isSignedIn },
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {isSignedIn && (
        <>
          <p className="text-center text-2xl text-white">
            {secretMessage && (
              <span>
                {" "}
                {secretMessage} click the user button!
                <br />
              </span>
            )}
          </p>
          <div className="flex items-center justify-center">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: {
                    width: "3rem",
                    height: "3rem",
                  },
                },
              }}
            />
          </div>
        </>
      )}
      {!isSignedIn && (
        <p className="text-center text-2xl text-white">
          <Link href="/sign-in">Sign In</Link>
        </p>
      )}
    </div>
  );
};
// export const getServerSideProps: GetServerSideProps = async (ctx) => {
//   const { userId } = getAuth(ctx.req)
//   console.log('userId from getserversideprops:', userId)
//   return {
//     props: {userId}, // will be passed to the page component as props
//   }
// }

