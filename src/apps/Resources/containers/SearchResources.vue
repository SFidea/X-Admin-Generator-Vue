/**
* Created by OXOYO on 2017/12/7.
*
* 查询资源
*/

<style scoped lang="less" rel="stylesheet/less">

</style>

<template>
  <div class="search-panel">
    <Form
      class="search-form"
      inline
      :model="searchForm"
      @submit.native.prevent
    >
      <FormItem>
        <Input
          v-model="searchForm.keywords"
          :placeholder="filterTypeLabel[searchForm.filterType]['placeholder']"
          @on-enter.stop.prevent="doSearch"
          style="width: 300px"
        >
          <Select v-model="searchForm.filterType" slot="prepend" style="width: 120px">
            <Option
              v-for="(val, key) in filterTypeLabel"
              :value="key"
              :key="key"
            >
              {{ val['label'] }}
            </Option>
          </Select>
        </Input>
      </FormItem>
      <FormItem>
        <CheckboxGroup v-model="searchForm.enable">
          <Checkbox :label="1">
            <span>启用</span>
          </Checkbox>
          <Checkbox :label="0">
            <span>停用</span>
          </Checkbox>
        </CheckboxGroup>
      </FormItem>
      <FormItem>
        <CheckboxGroup v-model="searchForm.type">
          <Checkbox
            v-for="item in $X.config.resourceTypeList.filter(item => item.enable)"
            :key="item.name"
            :label="item.name"
          >
            <span>{{ item.label }}</span>
          </Checkbox>
        </CheckboxGroup>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="doSearch">查询</Button>
      </FormItem>
    </Form>
    <div class="clear"></div>
    <Table
      class="search-form-table"
      v-if="tableData.length"
      :data="tableData"
      :columns="tableColumns"
    ></Table>
    <Page
      class="search-form-page"
      v-if="pageInfo.total"
      :total="pageInfo.total"
      :current="pageInfo.currentPage"
      :page-size="pageInfo.pageSize"
      placement="top"
      show-sizer
      show-elevator
      show-total
      @on-change="pageChange"
      @on-page-size-change="pageSizeChange"
    ></Page>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'SearchResources',
    data () {
      let _t = this
      return {
        // 过滤方式提示语
        filterTypeLabel: {
          title: {
            label: '资源标题',
            placeholder: '请输入资源标题（中文/英文）'
          },
          name: {
            label: '资源名称',
            placeholder: '请输入资源名称（英文）'
          },
          parent_id: {
            label: '父ID',
            placeholder: '请输入父ID，一级节点父ID为0'
          }
        },
        searchForm: {
          keywords: '',
          filterType: 'title',
          enable: [],
          type: []
        },
        tableColumns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: 'ID',
            key: 'id'
          },
          {
            title: '资源名称（英文）',
            key: 'name'
          },
          {
            title: '资源标题（中文/英文）',
            key: 'title'
          },
          {
            title: '图标',
            key: 'icon',
            render: (h, params) => {
              let iconType = params.row.icon
              if (iconType) {
                return h('Icon', {
                  props: {
                    type: iconType
                  },
                  style: {
                    fontSize: '20px',
                    marginRight: '10px',
                    verticalAlign: 'middle'
                  }
                })
              }
              return h('span', '-')
            }
          },
          {
            title: '父ID',
            key: 'parent_id',
            render: (h, params) => {
              let text = '-'
              if (params['row']['parent_id'] !== null) {
                text = params['row']['parent_id']
              }
              return h('span', text)
            }
          },
          // {
          //   title: '序号',
          //   key: 'num'
          // },
          {
            title: '资源类别',
            key: 'type',
            render: (h, params) => {
              let target = _t.$X.config.resourceTypeList.find(item => item.name === params.row.type)
              if (target) {
                return h('Tag', {
                  props: {
                    color: target.color || ''
                  }
                }, target.label)
              }
              return h('span', '-')
            }
          },
          {
            title: '新窗口打开',
            key: 'target',
            render: (h, params) => {
              if (params.row.type === 'module-link') {
                return h('XSwitch',
                  {
                    props: {
                      size: 'large',
                      callbackParams: params.index,
                      beforeToggle: _t.switchTarget,
                      value: !!params.row.target,
                      disabled: !_t.verifyPermission(_t.$route.name, 1)
                    }
                  },
                  [
                    h('span', {
                      slot: 'open'
                    }, '是'),
                    h('span', {
                      slot: 'close'
                    }, '否')
                  ]
                )
              } else {
                return h('span', '-')
              }
            }
          },
          {
            title: '启用/停用',
            key: 'enable',
            render: (h, params) => {
              return h('XSwitch',
                {
                  props: {
                    size: 'large',
                    callbackParams: params.index,
                    beforeToggle: _t.switchEnable,
                    value: !!params.row.enable,
                    disabled: !_t.verifyPermission(_t.$route.name, 1)
                  }
                },
                [
                  h('span', {
                    slot: 'open'
                  }, '启用'),
                  h('span', {
                    slot: 'close'
                  }, '停用')
                ]
              )
            }
          },
          // {
          //   title: '创建时间',
          //   key: 'create_time',
          //   render: (h, params) => {
          //     return h('span', _t.$X.moment(params.row['create_time']).format('YYYY-MM-DD hh:mm:ss'))
          //   }
          // },
          // {
          //   title: '更新时间',
          //   key: 'update_time',
          //   render: (h, params) => {
          //     return h('span', _t.$X.moment(params.row['update_time']).format('YYYY-MM-DD hh:mm:ss'))
          //   }
          // },
          {
            title: '操作',
            key: 'action',
            width: 250,
            render: (h, params) => {
              let btnArr = []
              let readArr = [
                h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    margin: '2px'
                  },
                  on: {
                    click: () => {
                      _t.handleAction('detail', params.row)
                    }
                  }
                }, '详情')
              ]
              let writeArr = [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    margin: '2px'
                  },
                  on: {
                    click: () => {
                      _t.handleAction('edit', params.row)
                    }
                  }
                }, '编辑'),
                h('Button', {
                  props: {
                    type: 'warning',
                    size: 'small'
                  },
                  style: {
                    margin: '2px'
                  },
                  on: {
                    click: () => {
                      _t.handleAction('addChild', params.row)
                    }
                  }
                }, '添加子节点'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    margin: '2px'
                  },
                  on: {
                    click: () => {
                      _t.handleAction('remove', params.row)
                    }
                  }
                }, '删除')
              ]
              if (_t.verifyPermission(_t.$route.name, 1)) {
                btnArr = [
                  ...readArr,
                  ...writeArr
                ]
              } else {
                btnArr = [
                  ...readArr
                ]
              }
              return h('div', btnArr)
            }
          }
        ],
        tableData: [],
        // 分页信息
        pageInfo: {
          currentPage: 1,
          total: 0,
          pageSize: 10
        }
      }
    },
    computed: {
      ...mapGetters('Platform', [
        'userInfo',
        'userClass',
        'verifyPermission'
      ])
    },
    methods: {
      // 执行查询
      doSearch: function () {
        let _t = this
        // 查询用户列表
        _t.initResourceList()
        return false
      },
      // 初始化列表，获取第一页数据
      initResourceList: function (isResetSearchForm) {
        let _t = this
        // 初始化分页
        _t.pageInfo = {
          currentPage: 1,
          total: 0,
          pageSize: 10
        }
        // 处理查询条件
        if (isResetSearchForm) {
          _t.searchForm = {
            keywords: '',
            filterType: 'title',
            enable: [],
            type: []
          }
        }
        // 调接口，初始化数据
        _t.getResourceList()
      },
      getResourceList: async function () {
        let _t = this
        // 分发action，调接口
        let res = await _t.$store.dispatch('Apps/Resources/list', {
          currentPage: _t.pageInfo.currentPage,
          pageSize: _t.pageInfo.pageSize,
          keywords: _t.searchForm.keywords,
          filterType: _t.searchForm.filterType,
          enable: _t.searchForm.enable,
          type: _t.searchForm.type
        })
        if (!res || res.code !== 200) {
          return
        }
        // 处理返回数据
        if (res.data.count && res.data.list && res.data.list.length) {
          _t.$Message.success(res.msg || '查询资源列表成功！')
        } else {
          _t.$Message.info('暂无数据！')
        }
        // 处理用户类型字段
        let resList = res.data.list || []
        resList = resList.map(item => {
          // 处理permission_type
          if (item.permission_type) {
            let tmpArr = item.permission_type.split(',')
            item.permission_type = tmpArr.map(val => parseInt(val))
          } else {
            item.permission_type = []
          }
          return item
        })
        // 更新表格数据
        _t.tableData = resList
        // 更新分页信息
        _t.pageInfo.total = res.data.count || 0
      },
      // 切换新窗口打开
      switchTarget: async function (index, oldStatus) {
        let _t = this
        // 处理参数
        if (index !== null) {
          let item = _t.tableData[index]
          // 准备参数执行状态更新
          let res = await _t.$store.dispatch('Apps/Resources/edit', {
            ...item,
            // 0 否 1 是
            target: oldStatus ? 0 : 1,
            permission_type: item.permission_type.join(',')
          })
          if (!res || res.code !== 200) {
            _t.$Message.error('操作失败！')
            return true
          }
          // 处理返回数据
          _t.$Message.success('操作成功！')
          // 刷新侧边栏
          _t.$X.utils.bus.$emit('Platform/Sidebar/refresh')
          return false
        } else {
          return true
        }
      },
      // 切换启用、停用
      switchEnable: async function (index, oldStatus) {
        let _t = this
        // 处理参数
        if (index !== null) {
          let item = _t.tableData[index]
          // 准备参数执行状态更新
          let res = await _t.$store.dispatch('Apps/Resources/edit', {
            ...item,
            // 0 停用 1 启用
            enable: oldStatus ? 0 : 1,
            permission_type: item.permission_type.join(',')
          })
          if (!res || res.code !== 200) {
            _t.$Message.error(oldStatus ? '停用失败！' : '启用失败！')
            return true
          }
          // 处理返回数据
          _t.$Message.success(oldStatus ? '停用成功！' : '启用成功！')
          // 刷新侧边栏
          _t.$X.utils.bus.$emit('Platform/Sidebar/refresh')
          return false
        } else {
          return true
        }
      },
      pageChange (pageNum) {
        let _t = this
        // 更新当前页
        _t.pageInfo.currentPage = pageNum
        // 调接口，初始化数据
        _t.getResourceList()
      },
      pageSizeChange: function (pageSize) {
        let _t = this
        // 更新分页量
        _t.pageInfo.pageSize = pageSize
        // 调接口，初始化数据
        _t.getResourceList()
      },
      doRemove: function (item) {
        let _t = this
        // 无选中项直接返回
        if (!item) {
          return
        }
        // 删除用户列表中所选用户
        _t.$Modal.confirm({
          title: '提示',
          content: '确认删除所选数据吗？',
          onOk: async function () {
            let res = await _t.$store.dispatch('Apps/Resources/remove', [
              item.id
            ])
            if (!res || res.code !== 200) {
              return
            }
            _t.$Message.info(res.msg || '删除账号成功！')
            // 更新账号列表
            _t.initResourceList()
          }
        })
      },
      doEdit: async function (item) {
        let _t = this
        // 无选中项直接返回
        if (!item) {
          return
        }
        // 广播事件
        _t.$X.utils.bus.$emit('Apps/Resources/edit', {
          action: 'edit',
          info: item
        })
      },
      doAddChild: async function (item) {
        let _t = this
        // 无选中项直接返回
        if (!item) {
          return
        }
        // 广播事件
        _t.$X.utils.bus.$emit('Apps/Resources/edit', {
          action: 'addChild',
          info: item
        })
      },
      handleDetail: function (item) {
        let _t = this
        // 广播事件
        _t.$X.utils.bus.$emit('Apps/Resources/detail', {
          action: 'detail',
          info: item
        })
      },
      handleAction: function (action, item) {
        let _t = this
        if (!action || !item) {
          return
        }
        switch (action) {
          case 'detail':
            _t.handleDetail(item)
            break
          case 'edit':
            _t.doEdit(item)
            break
          case 'addChild':
            _t.doAddChild(item)
            break
          case 'remove':
            _t.doRemove(item)
            break
        }
      }
    },
    created: function () {
      let _t = this
      // 监听
      _t.$X.utils.bus.$on('Apps/Resources/list/init', function () {
        // 初始化列表
        _t.initResourceList(true)
      })
      _t.$X.utils.bus.$on('Apps/Resources/list/refresh', function () {
        // 初始化列表
        _t.initResourceList()
      })
    },
    beforeDestroy: function () {
      let _t = this
      // 销毁监听
      _t.$X.utils.bus.$off('Apps/Resources/list/init')
      _t.$X.utils.bus.$off('Apps/Resources/list/refresh')
    }
  }
</script>
