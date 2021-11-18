import Head from 'next/head'
import styles from '../scss/Home.module.scss'
import Link from 'next/link';

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Farm1 ระบบควบคุมฟาร์ม IoT</title>
                <meta name="description" content="ฟาร์มควบคุมด้วยระบบ IoT ตรวจสอบ ติดตาม และเพิ่มผลผลิต อย่างต่อเนื่อง" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1>Farm1 • ระบบควบคุมฟาร์ม IoT</h1>
                <div className={styles.centerBox}>
                    <div className={styles.box}>
                        <div>
                            <span></span>
                            <img src="drawing.svg" />
                        </div>
                        <div>
                            <ul>
                                <li><a href="javascript:alert('เว็บไซต์ยังไม่พร้อม ... แต่พร้อมเร็ว ๆ นี้ _/|\\_');">เข้าหน้าเว็บไซต์หลัก</a></li>
                                <li>
                                    <Link href={"/upload"} passHref><a>อัพเดทเฟิร์มแวร์</a></Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div>
                    <p>แพลตฟอร์ม Farm1 พัฒนาโดย <a href="https://www.artronshop.co.th">บริษัท อาร์ทรอน ชอป จำกัด</a> • <a href='https://www.freepik.com/photos/nature'>Nature photo created by freepik - www.freepik.com</a></p>
                </div>
            </main>
        </div>
    )
}
