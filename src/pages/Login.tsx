import React, { FC } from "react";
import { observer } from "mobx-react";
import { useMst } from "../models/RootModel";

interface ILoginPageInterface {}

export const Login: FC<ILoginPageInterface> = observer(
  (props: ILoginPageInterface) => {
    const { router, login } = useMst();
    const onClick = () => {
      login.setIsLoggedIn(true);
      router.setView(router.views.get("Home"));
    };
    return (
      <div>
        <span>Login</span>
        <br />
        <button onClick={onClick}>Log in</button>
      </div>
    );
  }
);
