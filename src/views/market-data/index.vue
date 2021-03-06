<template>
  <div class="app-container">
    <!-- filter ↓ -->
    <div class="filter-container">
      <el-row :gutter="10" type="flex">
        <el-col>
          <el-input :clearable="true" placeholder="行情编码" v-model="listQuery.mDBCode" class="filter-item">
          </el-input>
        </el-col>
        <el-col>
          <el-select :clearable="true" placeholder="行情类型" filterable v-model="listQuery.priceType" class="filter-item">
            <el-option v-for="item in priceTypes" :key="item.Key" :label="item.Description" :value="item.Key">
            </el-option>
          </el-select>
        </el-col>
        <el-col>
          <el-select :clearable="true" placeholder="行情来源" filterable v-model="listQuery.source" class="filter-item">
            <el-option v-for="item in quotationSources" :key="item.Key" :label="item.Description" :value="item.Key">
            </el-option>
          </el-select>
        </el-col>
        <el-col>
          <el-select :clearable="true" placeholder="市场类型" filterable v-model="listQuery.marketType" class="filter-item">
            <el-option v-for="item in marketTypes" :key="item.Key" :label="item.Description" :value="item.Key">
            </el-option>
          </el-select>
        </el-col>
        <el-col>
          <el-date-picker
            v-model="listQuery.TradeDate"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            default-value="2018-01-01">
          </el-date-picker>
        </el-col>
        <el-col style="display: inline-flex;">
          <el-tooltip class="item" effect="dark" content="搜索" placement="top">
            <el-button type="primary" icon="el-icon-search" plain class="filter-item" @click="handleSearch">
              <span class="hidden-lg-and-down">搜索</span>
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="添加" placement="top-start" v-if="hasPermission">
            <el-button type="primary" icon="el-icon-edit" class="filter-item" @click="handleCreate">
              <span class="hidden-lg-and-down">添加</span>
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="批量导入" placement="top-start" v-if="hasPermission">
            <el-button type="info" icon="el-icon-upload2" class="filter-item" @click="handleImportMDBData">
              <span class="hidden-lg-and-down">导入</span>
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="批量导出" placement="top-start" v-if="hasPermission">
            <el-button type="info" icon="el-icon-download" class="filter-item" @click="handleExportMDBData">
              <span class="hidden-lg-and-down">导出</span>
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="刷新彭博行情" placement="top-start" v-if="hasPermission">
            <el-button type="success" icon="el-icon-refresh" title="刷新彭博行情" round class="filter-item"
                       @click="handleRefreshBloomberg">
              <span class="hidden-lg-and-down">彭博行情</span>
            </el-button>
          </el-tooltip>
        </el-col>
      </el-row>

    </div>
    <!-- table ↓ -->
    <div>
      <el-table
        ref="marketDataTable"
        :data="allMDBDataList.List"
        v-loading.body="listLoading"
        element-loading-text="拼命加载中。。。"
        border fit
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          align="center"
          width="55">
        </el-table-column>
        <el-table-column
          prop="MDBCodeCode"
          label="行情编码"
          align="center">
        </el-table-column>
        <el-table-column
          prop="TradeDate"
          sortable
          label="交易日期"
          :formatter="formatTradeDate"
          align="center">
        </el-table-column>
        <el-table-column
          prop="PriceTypeNote"
          align="center"
          label="行情类型">
        </el-table-column>
        <el-table-column
          prop="PriceValue"
          header-align="center"
          align="right"
          label="行情值">
        </el-table-column>
        <el-table-column
          prop="SourceNote"
          align="center"
          label="行情来源">
        </el-table-column>
        <el-table-column
          prop="MarketTypeNote"
          align="center"
          label="市场类型">
        </el-table-column>
        <el-table-column
          prop="LastUpdateTime"
          sortable
          align="center"
          :formatter="format_yyyy_mm_dd_hh_mm_ss"
          :show-overflow-tooltip="true"
          label="更新时间">
        </el-table-column>
        <el-table-column
          v-if="hasPermission"
          label="操作"
          align="center"
          fixed="right"
          width="80">
          <template slot-scope="scope">
            <el-dropdown size="medium" v-if="scope.row.SourceNote === '手工录入'">
              <el-button type="text">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <el-button type="text" @click="handleUpdate(scope.row)">编辑</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
        <template slot="append">
          <el-row>
            <el-col :span="2">
              <transition name="bounce">
                <el-button type="danger"
                           style="margin: 10px;"
                           v-show="hasPermission && isShowBatchDeleteBtn"
                           @click="handleBatchDelete">批量删除
                </el-button>
              </transition>
            </el-col>
            <el-col :span="22">
              <transition name="fade">
                <p v-show="hasPermission && isShowBatchDeleteBtn">
                  共选中了
                  <el-tag type="danger">{{multipleSelection.length}}</el-tag>
                  条
                </p>
              </transition>
            </el-col>
          </el-row>
        </template>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          :current-page.sync="listQuery.CurrentPage"
          :page-sizes="[10,20,30,50]"
          :page-size="listQuery.PageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>

      <!-- add/update dialog -->
      <div>
        <el-dialog :title="textMap[dialogStatus]"
                   :visible.sync="dialogFormVisible"
                   :close-on-click-modal="false"
                   width="550px">
          <el-form :rules="rules"
                   ref="dataForm"
                   :model="mDBDataItem"
                   label-position="left"
                   label-width="80px"
                   style='width: 400px; margin-left:50px;'>
            <el-form-item label="行情编码">
              <el-select class="filter-item" v-model="mDBDataItem.MDBCodeId"
                         placeholder="请选择行情编码" filterable
                         :disabled="dialogStatus === 'update'"
                         style="width: 100%;">
                <el-option v-for="item in mDBCodes" :key="item.Id" :label="item.MDBCode"
                           :value="item.Id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="交易日期" prop="TradeDate">
              <el-date-picker :disabled="dialogStatus ==='update'" v-model="mDBDataItem.TradeDate" type="date"
                              disabledDate="return true" placeholder="选择日期" value-format="yyyy-MM-dd"
                              style="width: 100%;">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="行情类型">
              <el-select class="filter-item" :disabled="dialogStatus ==='update'" filterable
                         v-model="mDBDataItem.PriceType" placeholder="请选择" style="width: 100%;">
                <el-option v-for="item in priceTypes" :key="item.Key" :label="item.Description" :value="item.Key">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="行情值">
              <el-input v-model="mDBDataItem.PriceValue"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button v-if="dialogStatus === 'create'" type="primary" @click="createData">确 定</el-button>
            <el-button type="primary" v-else @click="updateData">确 定</el-button>
          </div>
        </el-dialog>
      </div>

      <!-- refresh bloomberg dialog -->
      <div>
        <el-dialog
          v-if="dialogBloombergVisible"
          title="刷新彭博行情"
          width="550px"
          :visible.sync="dialogBloombergVisible"
          :close-on-click-modal="false">
          <el-form
            label-position="right"
            label-width="110px"
            :status-icon="true"
            ref="refreshBloombergForm"
            :model="refreshBloomberg"
            :rules="refreshBloombergRules"
            style='width: 410px; margin-left: 35px;'>
            <el-form-item label="行情编码" prop="mDBCode">
              <el-select class="filter-item"
                         v-model="refreshBloomberg.mDBCode"
                         multiple filterable
                         :clearable="true"
                         placeholder="请选择行情编码"
                         style="width: 100%;">
                <el-option v-for="item in mDBCodes" :key="item.Id" :label="item.MDBCode"
                           :value="item.MDBCode">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="行情类型">
              <el-select :clearable="true" multiple placeholder="行情类型" v-model="refreshBloomberg.priceType"
                         filterable class="filter-item" style="width: 100%;">
                <el-option v-for="item in priceTypes" :key="item.Key" :label="item.Description" :value="item.Key">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="市场类型">
              <el-select :clearable="true" multiple placeholder="市场类型" v-model="refreshBloomberg.marketType"
                         filterable class="filter-item" style="width: 100%;">
                <el-option v-for="item in marketTypes" :key="item.Key" :label="item.Description" :value="item.Key">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="起止日期" prop="TradeDate">
              <el-date-picker
                v-model="refreshBloomberg.TradeDate"
                style="width: 100%;"
                type="daterange"
                value-format="yyyy-MM-dd"
                start-placeholder="起始日期"
                end-placeholder="截止日期"
                default-value="2018-01-01">
              </el-date-picker>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogBloombergVisible = false">取 消</el-button>
            <el-button type="primary" @click="doRefreshBloomberg">确 定</el-button>
          </div>
        </el-dialog>
      </div>

      <!-- import dialog -->
      <div>
        <el-dialog v-if="dialogImportVisible"
                   title="导入"
                   width="550px"
                   :visible.sync="dialogImportVisible"
                   :close-on-click-modal="false"
                   :before-close="handleBeforeClose">
          <upload-excel
            ref="upload"
            :previewData="previewData"
            :isImportSuccess="isImportSuccess"
            @do-preview="doPreview"
            @do-import="doImportCode">
          </upload-excel>
          <span slot="footer" class="dialog-footer">
            <el-button @click="handleBeforeClose">取 消
            </el-button>
            <el-button
              type="primary"
              :disabled="!isAllowImport"
              @click="handleSure">导 入
            </el-button>
          </span>
        </el-dialog>
      </div>

    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import uploadExcel from '@/components/uploadExcel/index'
  // import { setRefreshState } from '@/utils/auth'
  import {
    doExportMDBDataTemplateExcel,
    doExportMDNDataExcel,
    doRequestBloombergQuotation
  } from '../../api/market-data'
  import { formatDateYMD, formatDateYMDHMS } from '@/utils/index'
  import { exportExcel } from '../../components/mixins/exportExcel'

  export default {
    name: 'marketDataManagement',
    components: { uploadExcel },
    mixins: [exportExcel],
    data () {
      return {
        listLoading: false,
        listQuery: {
          CurrentPage: 1,
          PageSize: 10,
          mDBCode: '',
          TradeDate: '',
          priceType: '',
          PriceValue: '',
          source: '',
          marketType: ''
        },
        refreshBloomberg: {
          mDBCode: [],
          TradeDate: '',
          priceType: [],
          marketType: []
        },
        tableData: {
          List: [],
          Pagination: {
            CurrentPage: 1,
            PageCount: 1,
            PageSize: 10,
            TotalCount: 0
          }
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        dialogImportVisible: false,
        dialogBloombergVisible: false,
        rules: {},
        refreshBloombergRules: {
          mDBCode: [
            { required: true, message: '请选择行情编码', trigger: 'blur' }
          ],
          TradeDate: [
            { required: true, message: '请选择开始, 结束日期', trigger: 'blur' }
          ],
          priceType: [],
          marketType: []
        },
        previewData: {},
        isAllowImport: false,
        isImportSuccess: false,
        multipleSelection: []
      }
    },
    created () {
      this.getList()
    },
    mounted () {
      this.$store.commit('changeTemplateFileId', 0)
    },
    computed: {
      ...mapGetters([
        'marketTypes',
        'priceTypes',
        'quotationSources',
        'allMDBDataList',
        'mDBDataItem',
        'mDBCodes',
        'ws',
        'roles'
      ]),
      total () {
        if (this.allMDBDataList.Pagination !== undefined) {
          return this.allMDBDataList.Pagination.TotalCount
        }
      },
      hasPermission () {
        if (this.roles[0] !== undefined) {
          return this.roles[0].Code.indexOf('Admin') >= 0
        }
      },
      isShowBatchDeleteBtn () {
        return this.multipleSelection.length > 0
      }
    },
    methods: {
      getList () {
        this.listLoading = true
        this.$store.dispatch('allMDBDataList', this.listQuery)
          .then(() => {
            // this.tableData = this.allMDBDataList
            this.listLoading = false
          })
      },

      handleSearch: function () {
        this.getList()
      },

      handleCreate: function () {
        this.$store.commit('resetMDBDataItem')
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },

      handleUpdate: function (row) {
        this.$store.commit('GET_MDBDATA_BY_ID', row.Id)
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },

      handleDelete: function (row) {
        this.$confirm(`确认删除 行情编码: 【${row.MDBCodeCode}】`, '提示', {
          type: 'warning',
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          center: true
        }).then(() => {
          this.$store.dispatch('deleteMDBData', [row.Id]).then(() => {
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.getList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除操作'
          })
        })
      },

      handleBatchDelete: function () {
        this.$confirm(`确认批量删除 行情编码: 【${this.multipleSelection}】`, '提示', {
          type: 'warning',
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          center: true
        }).then(() => {
          this.$store.dispatch('deleteMDBData', this.multipleSelection).then(() => {
            this.$message({
              type: 'success',
              message: '批量删除成功'
            })
            this.getList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消批量删除操作'
          })
        })
      },

      createData: function () {
        this.$store.dispatch('addMDBData', [this.mDBDataItem])
          .then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
      },

      updateData: function () {
        this.$store.dispatch('updateMDBData', [this.mDBDataItem])
          .then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
      },

      handleSizeChange: function (val) {
        this.listQuery.PageSize = val
        this.getList()
      },

      handleCurrentChange: function (val) {
        this.listQuery.CurrentPage = val
        this.getList()
      },

      handleImportMDBData: function () {
        this.dialogImportVisible = true
        doExportMDBDataTemplateExcel()
          .then(response => {
            this.$store.commit('changeTemplateFileId', response.Data)
          })
          .catch(err => console.log(err))
      },

      handleExportMDBData: function () {
        doExportMDNDataExcel(this.listQuery)
          .then(response => {
            this.doExportExcelData(response.Data)
          })
      },

      handleSure: function () {
        this.previewData = {}
        this.$refs['upload'].handleImportExcel()
      },

      handleBeforeClose: function () {
        this.$store.commit('resetUpload')
        this.previewData = {}
        this.dialogImportVisible = false
      },

      doPreview: function (data) {
        this.$store.dispatch('doPreviewMDBData', data)
          .then(res => {
            this.previewData = res.Data
            this.$store.commit('changeIsPreviewCheck', false)
            if (res.Data.ImportAllowed) {
              this.isAllowImport = true
              this.$store.commit('changeStepActive', 2)
              this.$store.commit('changeFinishStatus', 'success')
            }
          })
          .catch(err => {
            this.$store.commit('changeIsPreviewCheck', false)
            console.log(err)
          })
      },

      doImportCode: function (data) {
        this.$store.dispatch('doImportMDBData', data)
          .then(res => {
            this.isImportSuccess = res.Status
            if (res.Status) {
              this.dialogImportVisible = false
              this.$store.commit('changeStepActive', 3)
              this.$store.commit('changeFinishStatus', 'success')
              if (this.isImportSuccess) {
                this.getList()
              }
            }
          })
      },

      handleRefreshBloomberg: function () {
        this.dialogBloombergVisible = true
        this.refreshBloomberg = {}
      },

      doRefreshBloomberg: function () {
        this.$refs['refreshBloombergForm'].validate((valid) => {
          if (valid) {
            switch (this.ws.readyState) {
              case WebSocket.CONNECTING:
                this.$message({
                  type: 'info',
                  message: '正在连接'
                })
                break
              case WebSocket.OPEN:
                doRequestBloombergQuotation(this.refreshBloomberg)
                  .then(response => {
                    this.dialogBloombergVisible = false
                    this.$message.info('后台刷新中。。。')
                  })
                  .catch(() => {
                    this.dialogBloombergVisible = false
                  })
                break
              case WebSocket.CLOSING:
                this.$message({
                  type: 'info',
                  message: '正在关闭'
                })
                break
              case WebSocket.CLOSED:
                this.$message({
                  type: 'error',
                  message: '失去连接，请稍后重试'
                })
                break
              default:
                break
            }
          } else {
            return false
          }
        })
        // setRefreshState('true')
      },

      formatTradeDate: function (row, column, cellValue) {
        // TODO FIXME elementUI bug , 重复执行，自定义filter也是这样，应该是框架 update 渲染问题。
        return formatDateYMD(cellValue)
      },

      format_yyyy_mm_dd_hh_mm_ss (row, column, cellValue) {
        // TODO FIXME elementUI bug , 重复执行，自定义filter也是这样，应该是框架 update 渲染问题。
        return formatDateYMDHMS(cellValue)
      },

      handleSelectionChange: function (val) {
        this.multipleSelection = val.filter(b => {
          if (b.Source === 1) {
            return true
          }
          this.$refs.marketDataTable.toggleRowSelection(b)
        }).map(a => a.Id)
      }
    }
  }
</script>
