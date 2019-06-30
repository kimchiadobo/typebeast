import React, { Component } from 'react';
import CarSlider from './../components/CarSlider/CarSlider';
import SocialMedia from './../components/SocialMedia/SocialMedia';
import PlayNow from './../components/PlayNow/PlayNow';

import { BrowserRouter as Router } from 'react-router-dom';

import tokenValidation from './../lib/tokenValidationHelper';

class MainPage extends Component {

  componentDidMount() {
    this.setState({ user: tokenValidation() });
  }

  render() {
    // console.log(SocialMedia);

    return (
      <div>
        <Router>
          <div>
            <SocialMedia />
            <CarSlider />
            <PlayNow />
          </div>
        </Router>
      </div>
    );
  }
}

export default MainPage;
