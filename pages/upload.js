import Head from 'next/head';
import styles from '../scss/Upload.module.scss';
import React from 'react';
import EspLoader, { SlipReadError, readLoop } from '../src/esptool';
import CircularProgress from '@mui/material/CircularProgress';

// -----------
const logMsg = text => console.log(text);

const debugMsg = (...args) => {
    function getStackTrace() {
        let stack = new Error().stack;
        stack = stack.split("\n").map(v => v.trim());
        for (let i = 0; i < 3; i++) {
            stack.shift();
        }

        let trace = [];
        for (let line of stack) {
            line = line.replace("at ", "");
            trace.push({
                "func": line.substr(0, line.indexOf("(") - 1),
                "pos": line.substring(line.indexOf(".js:") + 4, line.lastIndexOf(":"))
            });
        }

        return trace;
    }

    let stack = getStackTrace();
    stack.shift();
    let top = stack.shift();
    let prefix = '[' + top.func + ":" + top.pos + '] ';
    for (let arg of args) {
        if (typeof arg == "string") {
            logMsg(prefix + arg);
        } else if (typeof arg == "number") {
            logMsg(prefix + arg);
        } else if (typeof arg == "boolean") {
            logMsg(prefix + arg ? "true" : "false");
        } else if (Array.isArray(arg)) {
            logMsg(prefix + "[" + arg.map(value => espTool.toHex(value)).join(", ") + "]");
        } else if (typeof arg == "object" && (arg instanceof Uint8Array)) {
            logMsg(prefix + "[" + Array.from(arg).map(value => espTool.toHex(value)).join(", ") + "]");
        } else {
            logMsg(prefix + "Unhandled type of argument:" + typeof arg);
            console.log(arg);
        }
        prefix = "";  // Only show for first argument
    }
}

const formatMacAddr = macAddr => macAddr.map(value => value.toString(16).toUpperCase().padStart(2, "0")).join(":");

const firmwareFile = [
    {
        offset: 0x1000,
        file: "bootloader_dio_40m.bin"
    }, 
    {
        offset: 0x8000,
        file: "partitions.bin"
    },
    {
        offset: 0xe000,
        file: "boot_app0.bin"
    },
    {
        offset: 0x10000,
        // file: "firmware.bin"
        // file: "firmware-sht20.bin"
        // file: "firmware-sht20-smartconfigs.bin"
        file: "firmware-sht20-smartconfigs-no-debug.bin"
    }
]

export default function Home() {
    const [ uploadProgress, setUploadProgress ] = React.useState(-1);
    const [ textProcess, setTextProcess] = React.useState("");
    const [ uploadFinish, setUploadFinish ] = React.useState(false);

    const updateProgress = (part, percentage) => {
        console.log(`Upload [${part}]: ${percentage}%`);
        setUploadProgress(percentage);
    };

    const handleClickUpload = async () => {
        const espTool = new EspLoader({
            updateProgress,
            logMsg,
            debugMsg,
            debug: false
        });

        if (espTool.connected()) {
            await espTool.disconnect();
        }

        setTextProcess("เชื่อมต่อ...");
        setUploadProgress(-2);
        await espTool.connect()
        readLoop().catch((error) => {
            console.log("toggleUIConnected -> false");
            console.log(error);
        });

        let espToolStub = null;
        try {
            setTextProcess("เข้าโหมดอัพโหลด...");
            setUploadProgress(-2);
            if (await espTool.sync()) {
                logMsg("Connected to " + await espTool.chipName());
                logMsg("MAC Address: " + formatMacAddr(espTool.macAddr()));
                espToolStub = await espTool.runStub();
            } else {
                console.error("Sync error");
                setUploadProgress(-1);
                return;
            }
        } catch (e) {
            console.error(e);
            setUploadProgress(-1);
            return;
        }

        for (const { offset, file } of firmwareFile) {
            setTextProcess("อัพโหลด " + file);
            const data = await (await fetch(`/firmware/${file}`)).arrayBuffer();
            await espToolStub.flashData(data, offset, file);
        }

        await espTool.disconnect();
        setTextProcess("อัพเดทเสร็จสิ้น");
        setUploadFinish(true);
    };

    const handleClickGoToHandySense = () => {
        window.location = "https://dashboard.handysense.io";
    }

    React.useEffect(() => {
        if (!('serial' in navigator)) {
            window.alert("หน้าเว็บนี้ใช้งานได้กับโปรแกรม Google Chome หรือ Microsoft Edge เวอร์ชั่นล่าสุดเท่านั้น");
        }
    }, []);

    return (
        <div className={styles.container}>
            <Head>
                <title>อัพเดทเฟิร์มแวร์ Farm1</title>
                <meta name="description" content="อัพเดทเฟิร์มแวร์ HandySense ออนไลน์" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <header>
                    <div>
                        <div>
                            <img src="/Logo-crop.png" alt="Farm1 logo" />
                        </div>
                        <div>อัพเดทเฟิร์มแวร์ HandySense</div>
                    </div>
                    <div></div>
                    <div></div>
                    <div></div>
                </header>

                <article>
                    <div>
                        <img src="/drawing-nologo.svg" alt="" />
                        <div className="buttonBox">
                            {uploadProgress === -1 && <button onClick={handleClickUpload}>เชื่อมต่อและอัพโหลด</button>}
                            {uploadProgress !== -1 && <>
                                {!uploadFinish && <div className="text1">{uploadProgress === -2 ? textProcess : (uploadProgress + "%")}</div>}
                                <div className="text2">{uploadProgress >= 0 ? textProcess : ""}</div>
                                {uploadFinish && <button onClick={handleClickGoToHandySense}>เพิ่มเข้า HandySense</button>}
                            </>}
                        </div>
                        <div className="circle">
                            <div>
                                {(uploadProgress == -2 || uploadProgress >= 0) && <CircularProgress 
                                    variant={uploadProgress == -2 ? "indeterminate" : "determinate"} 
                                    value={uploadProgress} 
                                    sx={{
                                        color: "#2ECC71"
                                    }}
                                />}
                            </div>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    )
}
