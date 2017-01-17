import type { Dispatch, Store } from 'redux'

declare module 'react-redux' {
  declare type StatelessComponent<P> = (props: P) => ?React$Element<any>;

  declare class ConnectedComponent<OP, P, Def, St> extends React$Component<void, OP, void> {
    static WrappedComponent: Class<React$Component<Def, P, St>>;
    getWrappedInstance(): React$Component<Def, P, St>;
    static defaultProps: void;
    props: OP;
    state: void;
  }

  declare type ConnectedComponentClass<OP, P, Def, St> = Class<ConnectedComponent<OP, P, Def, St>>;

  declare type Connector<OP, P> = {
    (component: StatelessComponent<P>): ConnectedComponentClass<OP, P, void, void>;
    <Def, St>(component: Class<React$Component<Def, P, St>>): ConnectedComponentClass<OP, P, Def, St>;
  };

  declare class Provider<S, A> extends React$Component<void, { store: Store<S, A>, children?: any }, void> {
  }

  declare type ConnectOptions = {
    pure?: boolean,
    withRef?: boolean
  };

  declare function connect(
    mapStateToProps: any,
    mapDispatchToProps: any,
    mergeProps: any,
    options?: ConnectOptions
  ): Connector<OP, $Supertype<SP & { dispatch: Dispatch<A> } & OP>>;
}
