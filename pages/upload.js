import Head from 'next/head'
import styles from '../scss/Upload.module.scss'

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>อัพเดทเฟิร์มแวร์ Farm1</title>
                <meta name="description" content="อัพเดทเฟิร์มแวร์ HandySense ออนไลน์" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                
            </main>
        </div>
    )
}
