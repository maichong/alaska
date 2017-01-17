import type { Store } from 'redux';

declare module 'react-redux' {
  declare class Provider<S, A> extends React$Component<void, { store: Store<S, A>, children?: any }, void> {
  }

  declare type ConnectOptions = {
    pure?: boolean,
    withRef?: boolean
  };

  declare type ReactClass = Class<React$Component<void, Object, any>>;

  declare function connect(mapStateToProps: any,
                           mapDispatchToProps: any,
                           mergeProps: any,
                           options?: ConnectOptions): ((ReactClass) => (ReactClass));
}
