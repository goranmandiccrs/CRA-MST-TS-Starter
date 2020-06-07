import React, {FC} from "react";
import {observer} from "mobx-react";

interface IHomePageInterface {

}

export const Home:FC<IHomePageInterface> = observer((props: IHomePageInterface) => {
  return <div>Home</div>;
});
