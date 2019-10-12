import React, {
  forwardRef, Ref, useCallback, useEffect, useRef,
  useState
}                      from "react";
import style           from './style.scss';
import {useTwglEffect} from "~/renderer/components/D3GL/compute-data";

export interface OriginList {
  id: string,
  ref: Element | null,
  data: any[],

}

// let origins: OriginList[] = [
//   {
//     id  : "oid_0",
//     ref : null,
//     data: []
//   },
//   {
//     id  : "oid_1",
//     ref : null,
//     data: []
//   },
// ];

type ItemProp = {
  id: string,
  color: string,
  registerCallback?: (ref: HTMLDivElement) => void
}

const ListItem = forwardRef((props: ItemProp, ref: Ref<HTMLDivElement>) => {
  const {color, registerCallback, id} = props;
  return <div id={id} style={{color}} className={'list-item'}>
    <div ref={ref} className={`view vod${id}`}/>
    <div className="description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eget enim mauris. In
      quis orci augue. Suspendisse aliquam enim non sem scelerisque pulvinar. Vestibulum elementum rhoncus tortor, a
      dapibus massa maximus vel. Praesent feugiat rutrum est a feugiat. Nam quis metus in arcu hendrerit molestie. Donec
      tempor purus id egestas convallis. Etiam libero nulla, gravida a eros at, blandit varius risus. Vivamus ut dui mi.
    </div>
  </div>;
});

const List: React.FC = React.memo(() => {
  const [origins, setOrigins] = useState<OriginList[]>([]);
  const canv                  = useRef(null);
  const updateCnt             = useCallback((val: number) => {
    setOrigins(old => {
      const l = old.length;
      if (val < 0) {
        return old.slice(0, l - 1);
      }
      return [...old, {
        id  : `oid_${l}`,
        ref : null,
        data: [[-1, -0.5, 0, 0.3, 1]]
      }];

    });
  }, []);
  const ref_cb                = useCallback((el: HTMLDivElement | null, index: number) => {
    if (el === null) {
      return;
    }
    if (origins[index]) {
      origins[index].ref = el;
    }

  }, [origins]);
  useTwglEffect(canv, origins);

  //init 1
  useEffect(() => {
    // updateCnt(1);
  }, []);

  const origins_list = origins.map((origin, i) => {
    return <ListItem color={'red'} key={i} id={`oid_${i}`} ref={ref => ref_cb(ref, i)}/>;
  });

  return <>
    <canvas className={style.Canvas} ref={canv}/>
    <div className={style.List}>
      <br/><br/>
      <div>{origins.length}
        <button onClick={() => updateCnt(1)}>+</button>
        <button onClick={() => updateCnt(-1)}>-</button>
      </div>
      {origins_list}
    </div>
  </>;
});
export default List;
