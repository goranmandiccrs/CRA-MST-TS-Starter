import React, {FC} from "react";
import {observer} from "mobx-react";

interface ILoginPageInterface {

}

export const Login:FC<ILoginPageInterface> = observer((props: ILoginPageInterface) => {
  return <div>Login</div>;
});
