export const content = {
  appMeta: {
    title: "valentines day!!!",
    recipientName: "my meggy",
    senderName: "your hyunny",
  },
  uiText: {
    completed: {
      chip: "MY MEGGY!!!",
      titlePrefix: "HIIIII",
      message: "WELCOME TO THE EPIC MEGGY VALENTINES DAY MINI PLAYTHROUGH",
      replayButton: "start!!!!!!!!!!!!",
      jumpFinalButton: "just read my message hehehe (DO NOT PRESS FIRST TIME!)",
    },
    welcome: {
      chipPrefix: "for",
      message:
        "a little mini game i made for my meggy, click start!! heheheh",
      startButton: "start",
    },
    scene: {
      chipPrefix: "story",
      chipConnector: "of",
      nextButton: "next!",
    },
    photos: {
      fallbackCaption: "one of my favorite pictures",
      collageCaptionPrefix: "memoryyyyy",
      collageAltPrefix: "memory",
      missingTitle: "oops this is an error pls lmk",
      missingHint: "let me know and *check assets/photos/ naming.",
    },
    heartCatch: {
      chip: "game 1!!! you shall not pass",
      title: "catch my heart heheh",
      instructionsPrefix: "tap the moving heart before time runs out! target:",
      instructionsMiddle: "hearts in",
      instructionsSuffix: "seconds",
      scoreLabel: "score:",
      timeLabel: "time:",
      ariaTapHeart: "tap heart",
      readyNote: "ready or not here we go!!",
      startButton: "start!!",
      continueButton: "continue",
      retryButton: "retry",
      passNote: "GOOD JOB MY MEGGY",
      failNote: "almost there my meggy you got this",
      goNote: "GOOOOOO!!",
      icon: "<3",
    },
    memoryMatch: {
      chip: "second game!!!",
      title: "my meggyIQ test",
      instructionsPrefix: "match all da",
      instructionsMiddle: "pairs before time runs out",
      instructionsSuffix: "lowk the timer is high so no need to stress",
      pairsLeftLabel: "pairs left:",
      timeLabel: "time:",
      gridAriaLabel: "memory cards",
      noteStart: "tap any card to start!!",
      continueButton: "continue",
      retryButton: "retry? you got this!!",
      noteWin: "GOOOD JOB ONCE MORE MY MEGGY IS SO SMART",
      noteLose: "this test is no reflection of the real meggyIQ. try again!",
      cardAriaLabel: "memory card",
      cardBackLabel: "?",
      icons: ["A", "B", "C", "D", "E", "F"],
    },
    final: {
      chip: "final reveal.....",
      replayButton: "replay??",
      signaturePrefix: "-",
    },
  },
  scenes: [
    {
      id: "scene-1",
      title: "hello my dearest",
      message:
        "this is for you!! the best valentines and the best girlfriend ever",
      photoSlot: 0,
    },
    {
      id: "scene-2",
      title: "us!!!",
      message:
        "i love every picture of you and of us so it was very hard to choose",
      photoSlot: 3,
    },
    {
      id: "scene-3",
      title: "you are the prettiest",
      message:
        "my meggy, you are the prettiest and most gorgeous girl ever",
      photoSlot: 6,
    },
    {
      id: "scene-4",
      title: "you are the loveliest",
      message:
        "you are also the loveliest girl ever and i love you so much",
      photoSlot: 9,
    },
  ],
  miniGames: {
    heartCatch: {
      durationSeconds: 20,
      targetScore: 12,
      moveEveryMs: 700,
    },
    memoryMatch: {
      pairs: 4,
      durationSeconds: 75,
    },
  },
  finalLetter: {
    title: "HAPPY VALENTINES DAY!!!",
    message: `my dearest meggy, happy valentines day to my favorite person ever!!!
every day with you is my favorite day and i still get so happy just seeing your face hehehe
you are so pretty, so lovely, so funny, and genuinely the best girlfriend (and wife) in the universe

thank you for loving me, being patient with me, and always being there for me
i love our little moments and our great moments and even the random silly moments where we just laugh at nothing
i love you now, i loved you before, and i will love you forever and ever and ever

i am so lucky to have my meggy
you are my home, my peace, and my favorite everything

sincerely and with all my love,
your hyunny`,
  },
  photos: [
    "photo-01.jpg",
    "photo-02.jpg",
    "photo-03.jpg",
    "photo-04.jpg",
    "photo-05.jpg",
    "photo-06.jpg",
    "photo-07.jpg",
    "photo-08.jpg",
    "photo-09.jpg",
    "photo-10.jpg",
    "photo-11.jpg",
    "photo-12.jpg",
  ],
  captions: [
    "MY MEGGY IS SOSO CUTE",
    "SOSO PRETYTYTYT",
    "RAHHAHAHAHAHH",
    "MY FAVORITIEI",
    "youre so gorgeous",
    "I LOVEY OU OMG",
    "Ytogoether forever fr",
    "rhahahahhhh",
    "I LOVEY OU",
    "HAPPY VALENTINES MY MEGGY",
    "SO CUTEEEEE",
    "RAHHHHRHRHR",
  ],
};
