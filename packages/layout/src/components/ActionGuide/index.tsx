import { Button, Popover, Space } from 'antd';
import React, { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { ActionGuideContextConsumer, ActionGuideContextProvider } from './context';
import './index.less';
import type {
  ActionGuideAction,
  ActionGuideContainerProps,
  ActionGuideItemProps,
  PaginationProps,
} from './interface';

function recursiveMap(children: ReactNode, fn: (child: ReactNode) => any): ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    if (child.props.children) {
      // eslint-disable-next-line no-param-reassign
      child = React.cloneElement(child, {
        children: recursiveMap(child.props.children, fn),
      });
    }

    return fn(child);
  });
}

const prefixCls = 'pro-action-guide';
function getPageItem(total: number, cur: number = 0, showPaginationSize = 3): number[] {
  const list = new Array(total).fill(0).map((item, idx) => idx);
  if (total <= showPaginationSize) return list;
  let l = -1;
  let r = l + showPaginationSize - 1;
  let mid = (l + r) >> 1;
  while (mid < cur && r < total) {
    l++;
    r++;
    mid = (l + r) >> 1;
  }
  const res = list.filter((item) => item >= l && item <= r);
  console.log(l, r, cur - 1, showPaginationSize >> 1, res);
  return res;
}
const Pagination: React.FC<PaginationProps> = (props) => {
  const {
    theme = 'dot',
    total,
    cur = 0,
    clickabled = true,
    onChange,
    showPaginationSize = 3,
  } = props;
  const list = getPageItem(total, cur, showPaginationSize);

  return (
    <div className={`pagination ${theme === 'dot' ? `theme-dot` : `theme-index`}`}>
      {list.map((item, idx) => (
        <div
          key={idx}
          className={`pagination-item ${cur === item + 1 ? 'cur' : ''}`}
          onClick={() => {
            if (!clickabled) return;
            onChange(idx + 1);
          }}
        >
          {theme === 'index' ? item + 1 : ''}
        </div>
      ))}
    </div>
  );
};
export const ActionGuideContainer: React.FC<PropsWithChildren<ActionGuideContainerProps>> = (
  props,
) => {
  const { defaultIndex = -1, children, actionRef } = props;
  const [curIdx, setCurIdx] = useState(defaultIndex);
  const [itemCnt, setItemCnt] = useState(0);
  const action: ActionGuideAction = {
    show: (idx) => setCurIdx(idx),
  };
  if (actionRef && !actionRef.current) {
    actionRef.current = action;
  }
  useEffect(() => {
    let cnt = 0;
    recursiveMap(children, (child) => {
      // @ts-ignore
      if (child.type.displayName === 'ActionGuideItem') {
        cnt++;
      }
    });
    setItemCnt(cnt);
  }, [children]);
  return (
    <ActionGuideContextProvider
      value={{
        ...props,
        action,
        curIdx,
        total: itemCnt,
      }}
    >
      {children}
    </ActionGuideContextProvider>
  );
};
ActionGuideContainer.displayName = 'ActionGuideContainer';

export const ActionGuideItem: React.FC<PropsWithChildren<ActionGuideItemProps>> = (props) => {
  const { children, content, step } = props;

  return (
    <ActionGuideContextConsumer>
      {(ctx) => {
        if (!ctx) return null;
        const defaultPagination = (
          <Pagination
            total={ctx.total}
            cur={ctx.curIdx}
            showPaginationSize={ctx.showPaginationSize}
            theme={ctx.paginationTheme ?? 'dot'}
            onChange={(idx) => ctx.action.show(idx)}
          />
        );
        const displayTitle = ctx?.title
          ? typeof ctx.title === 'function'
            ? ctx.title(ctx.curIdx)
            : ctx.title
          : null;
        const displayPagination =
          ctx?.pagination === false
            ? null
            : ctx?.pagination === undefined
            ? defaultPagination
            : ctx.pagination(ctx.curIdx, ctx.action);
        const userContent = typeof content === 'function' ? content(ctx.curIdx) : content;
        const displayContent = (
          <div className={`${prefixCls}-content-box`}>
            <div className={`content-container`}>{userContent}</div>
            <div className={`footer-container`}>
              <div className={`pagination-box`}>{displayPagination}</div>
              <div className={`btn-group`}>
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                      if (ctx.curIdx === ctx.total) {
                        ctx.action.show(-1);
                      } else {
                        ctx.action.show(ctx.curIdx + 1);
                      }
                    }}
                  >
                    {ctx.curIdx === ctx.total || ctx.curIdx === -1 ? '我知道了' : '下一步'}
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        );
        return (
          <Popover title={displayTitle} content={displayContent} visible={ctx.curIdx === step}>
            {children}
          </Popover>
        );
      }}
    </ActionGuideContextConsumer>
  );
};

ActionGuideItem.displayName = 'ActionGuideItem';