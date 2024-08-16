window.onload = async () => {
  const video = document.querySelector("#camera");
  const backCanvas = document.querySelector("#picture");
  const aaCanvas = document.querySelector("#aaAreaCanvas");

  /*** カメラ使いたい人向け→videoのsrcは消しておく */
  // // カメラ設定
  // const constraints = {
  //   audio: false,
  //   video: {
  //     width: 1920,
  //     height: 1080,
  //     deviceId: {
  //       exact:
  //         "44d2e79eb15793683a1869415130029beced285e224f02e50f121cb6aaa4d16a", // OBSのカメラ、人によって違う
  //     },
  //     // facingMode: "user", // コメントを消してdeviceIdを消して、標準カメラを利用する（width, heightを変更する必要あり）
  //   },
  // };

  // // カメラ初期化
  // const stream = await navigator.mediaDevices.getUserMedia(constraints);
  // /** カメラ列挙してID調べたい場合はコメントはずす
  // const devices = await navigator.mediaDevices.enumerateDevices();
  // console.log(devices);
  // */
  // video.srcObject = stream;
  // video.onloadedmetadata = async (e) => {
  //   video.play();
  // };
  /*** カメラ使いたい人向け　ここまで */

  const colorset = "艶臆保和田ぼだずぶやすかたし？｜￤：・っ。、．　"; //濃淡用テキスト
  let viewRange = 12; // Viewの初期サイズ
  let frameCount = 0; // FPSカウント
  let fpsTimer = 0; // FPS計測用タイマー
  let fps = 0; // FPS

  const ctx = backCanvas.getContext("2d");
  const ctxC = aaCanvas.getContext("2d");

  // フォントサイズが変わった時の処理
  const validChange = () => {
    aaCanvas.width = backCanvas.width;
    aaCanvas.height = backCanvas.height;
    aaCanvas.style.backgroundColor = "white";
  };

  // フォントサイズの初期化
  validChange();

  // メインの描画処理
  const view = async () => {
    // カメラからキャンバスへ描画、この時点でリサイズ
    ctx.drawImage(
      video,
      0,
      0,
      Math.floor(backCanvas.width / viewRange),
      Math.floor(backCanvas.height / viewRange)
    );

    // canvasからバイナリデータを取得
    const myImageData = ctx.getImageData(
      0,
      0,
      Math.floor(backCanvas.width / viewRange),
      Math.floor(backCanvas.height / viewRange)
    );

    // テキスト描画の初期化
    ctxC.textAlign = "start";
    ctxC.fillStyle = "white";
    ctxC.fillRect(0, 0, aaCanvas.width, aaCanvas.height);

    // テキスト描画関係初期化
    let textLineCount = 0;
    let lineCount = 0;
    let textCount = 0;

    // AAテキスト描画の設定
    ctxC.fillStyle = "black";
    ctxC.font = viewRange + "px MS Gothic";

    // バイナリデータを4バイトずつ読み取り
    for (let i = 0; i < myImageData.data.length; i += 4) {
      // カラー情報からグレースケールに変換
      const gray = Math.floor(
        myImageData.data[i] * 0.299 +
          myImageData.data[i + 1] * 0.587 +
          myImageData.data[i + 2] * 0.114
      );

      // 改行位置計算用のカウンタ
      textLineCount++;

      // テキスト描画
      ctxC.fillText(
        /* グレースケールを元にテキストを作る */
        colorset[Math.floor(((colorset.length - 1) * gray) / 255)],
        textCount * viewRange,
        lineCount * viewRange,
        aaCanvas.width
      );

      // 文字位置計算用のカウンタ
      textCount++;

      // カウンタを元に改行処理
      if (textLineCount % Math.floor(backCanvas.width / viewRange) === 0) {
        textCount = 0;
        lineCount++;
      }
    }

    // 元動画のワイプ
    ctxC.drawImage(
      video,
      aaCanvas.width - 288,
      aaCanvas.height - 162,
      288,
      162
    );

    // FPSカウント
    frameCount++;

    // FPS描画
    ctxC.fillStyle = "white";
    ctxC.fillRect(aaCanvas.width - 100, 0, aaCanvas.width, 40);
    ctxC.textAlign = "end";
    ctxC.fillStyle = "green";
    ctxC.font = "bold 30px MS Gothic";
    if (fpsTimer < Date.now()) {
      fpsTimer = Date.now() + 1000;
      fps = frameCount;
      frameCount = 0;
    }
    ctxC.fillText(fps + "fps", aaCanvas.width, 30);

    // 再帰処理
    requestAnimationFrame(view);
  };

  // セレクトボックスの変更時の処理
  document.getElementById("viewRange").onchange = (e) => {
    viewRange = Number(e.target.value);
    validChange(); //フォントサイズが変わった時の処理を呼び出し
  };

  // Startボタンの処理
  document.getElementById("start").onclick = () => {
    video.play();
  };

  // Pauseボタンの処理
  document.getElementById("pause").onclick = () => {
    video.pause();
  };

  // Stopボタンの処理
  document.getElementById("stop").onclick = () => {
    video.pause();
    video.currentTime = 0;
  };

  // メイン描画処理開始
  requestAnimationFrame(view);
};
