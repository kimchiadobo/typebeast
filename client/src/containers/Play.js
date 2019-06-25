import React, { Component, Fragment } from 'react';
import './GameUI.scss';
// import DisplayQuote from './GameUI/GameUI';
import Background from './../components/Background/Background';
import DisplayQuoteArea from './../components/Quote/Quote';
import CarWPMGauge from './../components/Guages/WPMGuage';
import Minimap from './../components/Minimap/Minimap';
import DisplayQuoteInput from './../components/GameInput/GameInput';
import NosGauge from './../components/Guages/NOSGuage';
import socketIOClient from 'socket.io-client';
import StartGameButton from './../components/StartGameButton/StartGameButton';

const renderGame = props => {
  const countdown = props.countdown ? (
    <h1>{props.countdownCount}</h1>
  ) : (
    <StartGameButton startGame={props.onStartCountdown} />
  );

  const gameStart = props.timerStart ? (
    <Fragment>
      <DisplayQuoteArea
        completed={props.wordsCompleted}
        input={props.userInput}
        currentWord={props.words[props.index]}
        remaining={props.remainingPhrase}
      />
      <DisplayQuoteInput onUserInputChange={props.onUserInputChange} />
    </Fragment>
  ) : (
    <DisplayQuoteArea
      completed={''}
      input={''}
      currentWord={''}
      remaining={'Please wait for the game to start'}
    />
  );

  return props.timerFinished ? (
    <div className="DisplayQuote-container">
      <div className="DisplayQuote-previewQuote">
        <h1 className="DisplayQuote-h1">Congrats mffferr</h1>
      </div>
    </div>
  ) : (
    <div className="DisplayQuoteUI-container">
      <CarWPMGauge second={props.sec} char={props.char} socket={props.socket} />
      <div className="DisplayQuote-container">
        <Minimap />
        {gameStart}
        {countdown}
      </div>
      <NosGauge />
    </div>
  );
};

class PlayGameLogic extends Component {
  constructor() {
    super();

    this.state = {
      countdownCount: 5,
      countdown: false,
      loading: true,
      words: [],
      userInput: '',
      remainingPhrase: 'Hope is the first step on the road to regret.',
      index: 0,
      fullPhrase: 'Hope is the first step on the road to regret.',
      char: 0,
      sec: 0,
      carPositioning: 0,
      timer: 0,
      timerStart: false,
      timerFinished: false,
      finishLine: false,
      // Socket related properties:
      endpoint: 'http://127.0.0.1:8080',
      playerCount: 0,
      gameStart: false,
      playerProgress: {
        progress: 0,
        wpm: 0
      },
      wordsCompleted: ''
    };
  }

  componentDidMount() {
    // Deconstruct this.state.endpoint
    const { endpoint } = this.state;
    // Connect to the socket
    const socket = socketIOClient(endpoint);
    this.setState({
      socket
    });

    socket.on('welcome', message => {
      console.log(message.description);
      // Display welcome message. This should render so I want to set the state
    });

    socket.on('new-user-join', message => {
      console.log(message.description);
      // Display join message, this should also set state
    });

    socket.on('game-start', message => {
      console.log(message.description);
      // Display message saying game will start soon

      // Set a countdown and render the typing content
      let timerCount = 5;
      let that = this;

      function countdown() {
        setTimeout(() => {
          if (timerCount === 0) {
            console.log('Game start.');
            // finished = true;
            timerStuff();
            // return true;
          } else {
            console.log(timerCount);
            timerCount--;
            countdown();
          }
        }, 1000);
      }

      function timerStuff() {
        console.log('START');
        that.onStartTimer();
        that.setState({ timerStart: true });
        that.interval = setInterval(() => {
          that.setState(prevProps => {
            return { sec: prevProps.sec + 1, timer: prevProps.timer + 1 };
          });
        }, 1000);
      }

      countdown();

      // this.onFinishTimer(value);
    });

    socket.on('progress-broadcast', message => {
      console.log(message);
    });

    socket.on('player-left', message => {
      console.log(message.description);
    });

    const wordsArray = this.state.fullPhrase.split(' ');

    this.setState({
      words: wordsArray.map((word, index) => {
        if (index < wordsArray.length - 1) {
          return word + ' ';
        }

        return word;
      }),
      loading: false
    });

    // this.setState({ re})
  }

  render() {
    return this.props.children({
      ...this.state,
      onUserInputChange: this.onUserInputChange,
      onStartCountdown: this.onStartCountdown
    });
  }

  onUserInputChange = e => {
    e.preventDefault();

    let value = e.target.value;
    const { index, words, wordsCompleted } = this.state;

    if (value.length > words[index].length) {
      return;
    } else {
      this.setState({ userInput: value });
    }

    if (index === words.length - 1 && value === words[index]) {
      this.setState({ timerFinished: true });
      return;
    }

    if (value === words[index]) {
      this.setState({ wordsCompleted: wordsCompleted + value });
      this.setState({ index: index + 1 });
      this.setState({
        remainingPhrase: this.state.remainingPhrase.substring(
          words[index].length
        )
      });
      this.setState({ userInput: '' });

      e.target.value = '';
    }

    // console.log(value);

    // if (this.state.timerFinished) {
    //   e.target.value = '';
    // }

    // this.onStartTimer();
    // this.onFinishTimer(value);
    // this.setState({
    //   userInput: value,
    //   char: this.calculateCorrectChars(value),
    //   carPositioning: this.calculateCorrectChars(value) * 10
    // });
  };

  // calculateCorrectChars(userInput) {
  //   //remove whitespace
  //   const text = this.state.fullPhrase.replace(' ', '');
  //   //remove whitespace from user input and turn into array
  //   userInput = userInput.replace(' ', '').split('');
  //   //return how many characters user is typing correctly
  //   return userInput.filter((char, i) => char === text[i]).length;
  // }
  onStartCountdown = () => {
    if (!this.state.countdown) {
      this.setState({ countdown: true });
      this.interval = setInterval(() => {
        if (this.state.countdownCount === 1) {
          clearInterval(this.interval);
          console.log('timer stopped');

          this.setState({ timerStart: true });
          return;
        }
        this.setState(prevProps => {
          console.log(prevProps.countdownCount);
          return { countdownCount: prevProps.countdownCount - 1 };
        });
      }, 1000);
    }


  };

  onStartTimer = () => {
    if (!this.state.timerStart) {
      this.setState({ timerStart: true });
      this.interval = setInterval(() => {
        this.setState(prevProps => {
          return { sec: prevProps.sec + 1 };
        });
      }, 1000);
    }
  }

  onFinishTimer(userInput) {
    if (userInput === this.state.fullPhrase) {
      clearInterval(this.interval);
      this.setState({
        timerFinished: true
      });
    }
  }
}

export default () => {
  return (
    <PlayGameLogic>
      {values => (
        <div className="PlayGame">
          <Background
            carPositioning={values.carPositioning}
            onFinish={values.timerFinished}
          />

          {!values.loading
            ? renderGame({
                ...values
              })
            : 'loading'}
        </div>
      )}
    </PlayGameLogic>
  );
};
