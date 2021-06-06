import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview?: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  const handleNextPage = () => {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        const updatedPosts = [...posts];
        data.results.forEach(post => {
          const newPost = {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };

          updatedPosts.push(newPost);
          setNextPage(data.next_page);
        });
        setPosts(updatedPosts);
      });
  };

  return (
    <>
      <Head>
        <title>spacetraveling.</title>
      </Head>
      <Header />
      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts?.map((post: Post) => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>
                <div className={styles.postInfo}>
                  <time>
                    <FiCalendar />
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <small>
                    <FiUser />
                    {post.data.author}
                  </small>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {nextPage && (
          <button
            className={styles.loadMoreButton}
            type="button"
            onClick={handleNextPage}
          >
            Carregar mais posts
          </button>
        )}

        {preview && (
          <aside className={styles.preview}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      ref: previewData?.ref ?? null,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
      preview,
    },
  };
};
