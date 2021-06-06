/* eslint-disable react/no-array-index-key */
/* eslint-disable array-callback-return */
/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

type ContentBodyProps = {
  type: string;
  text: string;
};

type ContentProps = {
  heading: string;
  body: ContentBodyProps[];
};

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: ContentProps[];
  };
}

interface PostProps {
  post: Post;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const handleReadingTime = () => {
    const wordsCount = post.data.content.reduce((acc, text) => {
      const formattedText = RichText.asText(text.body);
      let total = acc;
      total += formattedText.split(' ').length + text.heading.split(' ').length;
      return Math.ceil(total / 180);
    }, 0);

    return wordsCount;
  };

  return (
    <>
      <Head>
        <title>{post.data.title} | spaceTraveling.</title>
      </Head>
      <Header />
      <main className={commonStyles.container}>
        <article className={styles.post}>
          <img src={post.data.banner.url} alt={post.data.title} />
          <h1>{post.data.title}</h1>
          <div className={styles.postInfo}>
            <time>
              <FiCalendar />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <small>
              <FiUser /> {post.data.author}
            </small>
            <small>
              <FiClock />
              {handleReadingTime()} min
            </small>
          </div>
          {post.data.content.map((item, index) => {
            return (
              <div className={styles.postContent} key={`content-${index}`}>
                <h2>{item.heading}</h2>
                {item.body?.map((bodyItem, bodyIndex) => {
                  return <p key={`body-${bodyIndex}`}>{bodyItem.text}</p>;
                })}
              </div>
            );
          })}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['post.slug'],
      pageSize: 5,
    }
  );

  const paths = posts.results?.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
