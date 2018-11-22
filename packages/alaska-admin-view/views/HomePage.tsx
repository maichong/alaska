import * as React from 'react';
import { HomePageProps } from '..';

interface HomePageState {
}

export default class HomePage extends React.Component<HomePageProps, HomePageState> {
  constructor(props: HomePageProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>HomePage</div>
    );
  }
}
