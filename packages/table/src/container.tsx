import { createContainer } from 'unstated-next';
import { useState, useRef, useMemo } from 'react';
import useMergedState from 'rc-util/lib/hooks/useMergedState';

import type { ProTableProps } from './index';
import type { DensitySize } from './components/ToolBar/DensityIcon';
import type { ActionType } from './typing';
import type { TableColumnType } from 'antd';
import { genColumnKey } from './utils';

export type ColumnsState = {
  show?: boolean;
  fixed?: 'right' | 'left' | undefined;
  order?: number;
};

export type UseContainerProps<T = any> = {
  columnsStateMap?: Record<string, ColumnsState>;
  onColumnsStateChange?: (map: Record<string, ColumnsState>) => void;
  size?: DensitySize;
  defaultSize?: DensitySize;
  onSizeChange?: (size: DensitySize) => void;
  columns?: TableColumnType<T>[];
};

function useContainer(props: UseContainerProps = {}) {
  const actionRef = useRef<ActionType>();
  /** 父 form item 的 name */
  const prefixNameRef = useRef<any>();
  const propsRef = useRef<ProTableProps<any, any, any>>();

  // 共享状态比较难，就放到这里了
  const [keyWords, setKeyWords] = useState<string | undefined>('');
  // 用于排序的数组
  const sortKeyColumns = useRef<string[]>([]);

  const [tableSize, setTableSize] = useMergedState<DensitySize>(
    () => props.size || props.defaultSize || 'middle',
    {
      value: props.size,
      onChange: props.onSizeChange,
    },
  );

  /** 默认全选中 */
  const defaultColumnKeyMap = useMemo(() => {
    const columnKeyMap = {};
    props.columns?.forEach(({ key, fixed }, index) => {
      const columnKey = genColumnKey(key, index);
      if (columnKey) {
        columnKeyMap[columnKey] = {
          show: true,
          fixed,
        };
      }
    });
    return columnKeyMap;
  }, [props.columns]);

  const [columnsMap, setColumnsMap] = useMergedState<Record<string, ColumnsState>>(
    () => props.columnsStateMap || defaultColumnKeyMap,
    {
      value: props.columnsStateMap,
      onChange: props.onColumnsStateChange,
    },
  );

  return {
    action: actionRef,
    setAction: (newAction?: ActionType) => {
      actionRef.current = newAction;
    },
    sortKeyColumns,
    setSortKeyColumns: (keys: string[]) => {
      sortKeyColumns.current = keys;
    },
    propsRef,
    columnsMap,
    keyWords,
    setKeyWords: (k: string | undefined) => setKeyWords(k),
    setTableSize,
    tableSize,
    prefixName: prefixNameRef.current,
    setPrefixName: (name: any) => {
      prefixNameRef.current = name;
    },
    setColumnsMap,
    columns: props.columns,
  };
}

const Container = createContainer<ReturnType<typeof useContainer>, UseContainerProps>(useContainer);

export type ContainerType = typeof useContainer;

export { useContainer };

export default Container;