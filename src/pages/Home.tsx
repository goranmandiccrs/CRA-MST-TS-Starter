import React, { FC } from "react";
import { observer } from "mobx-react";
import {useMst} from "../models/RootModel";

interface IHomePageInterface {}

export const Home: FC<IHomePageInterface> = observer(
  (props: IHomePageInterface) => {
    const { router } = useMst();
    const onClick = () => {
      router.setView(router.views.get("OtherPage"));
    }

    return (
      <div>
        <span>Home</span>
        <br/>
        <button onClick={onClick}>Other page</button>
      </div>
    );
  }
);
