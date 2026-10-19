// ===== Store Management Functions =====
  function openStoreModal(id) {
    var modal = document.getElementById('storeModal');
    var title = document.getElementById('storeModalTitle');
    
    // 设置当前编辑的门店ID（用于双向联动）
    currentEditingStoreId = id || null;
    
    // 先重置表单状态（确保从查看模式切换时正确恢复）
    resetStoreModalForEdit();
    
    // 清空表单
    document.getElementById('storeDealerName').value = '';
    document.getElementById('storeDealerCode').value = '';
    document.getElementById('storeDealerType').value = '';
    document.getElementById('storeStatus').value = '1';
    document.getElementById('storeBrand').value = '';
    // 省市区三级联动清空
    document.getElementById('storeProvinceSelect').value = '';
    document.getElementById('storeCitySelect').innerHTML = '<option value="">市</option>';
    document.getElementById('storeDistrictSelect').innerHTML = '<option value="">区/县</option>';
    // 品牌大区小区清空
    document.getElementById('storeRegion').innerHTML = '<option value="">请选择大区</option>';
    document.getElementById('storeSubRegion').innerHTML = '<option value="">请选择小区</option>';
    // 关联车系清空（新选择器）
    storeSelectedSeries = [];
    resetStoreModalSeries();
    document.getElementById('storeAfterSaleTel').value = '';
    document.getElementById('storeEmail').value = '';
    document.getElementById('storeAddress').value = '';
    document.getElementById('storeLongitude').value = '';
    document.getElementById('storeLatitude').value = '';
    
    if (id) {
      // 编辑模式 - 模拟数据填充
      var storeData = {
        1: { name: '深圳理想南山店', code: 'LIXIANG_SZ_NS_001', type: '1', status: '1', brand: '1', carSeries: ['1', '2'], provinceCode: '44', cityCode: '440300', district: '南山区', afterSaleTel: '0755-88888888', email: 'nanshan@lixiang.com', address: '科苑南路XX号', longitude: '113.9438', latitude: '22.5484' },
        2: { name: '深圳问界福田店', code: 'AITO_SZ_FT_001', type: '1', status: '1', brand: '2', carSeries: ['3', '8'], provinceCode: '44', cityCode: '440300', district: '福田区', afterSaleTel: '0755-66666666', email: 'futian@aito.com', address: '车公庙XX路XX号', longitude: '114.0555', latitude: '22.5431' },
        3: { name: '广州小鹏天河店', code: 'XIAOPENG_GZ_TH_001', type: '2', status: '1', brand: '3', carSeries: ['4', '10', '11'], provinceCode: '44', cityCode: '440100', district: '天河区', afterSaleTel: '020-33333333', email: 'tianhe@xiaopeng.com', address: '珠江新城XX路XX号', longitude: '113.3245', latitude: '23.1291' },
        4: { name: '广州东风日产专营店', code: 'DFN_GZ_TH_001', type: '1', status: '1', brand: '5', carSeries: ['13', '14'], provinceCode: '44', cityCode: '440100', district: '天河区', afterSaleTel: '020-38861234', email: 'gz_tianhe@dongfeng-nissan.com', address: '天河路385号太古汇一座', longitude: '113.3296', latitude: '23.1315' },
        5: { name: '深圳东风日产龙岗店', code: 'DFN_SZ_LG_001', type: '1', status: '1', brand: '5', carSeries: ['13', '15'], provinceCode: '44', cityCode: '440300', district: '龙岗区', afterSaleTel: '0755-28951234', email: 'sz_longgang@dongfeng-nissan.com', address: '龙翔大道7188号万科广场', longitude: '114.2523', latitude: '22.7206' },
        6: { name: '上海东风日产浦东店', code: 'DFN_SH_PD_001', type: '1', status: '1', brand: '5', carSeries: ['14', '16'], provinceCode: '31', cityCode: '310100', district: '浦东新区', afterSaleTel: '021-50881234', email: 'sh_pudong@dongfeng-nissan.com', address: '世纪大道100号环球金融中心', longitude: '121.5119', latitude: '31.2363' },
        7: { name: '佛山东风日产禅城店', code: 'DFN_FS_CC_001', type: '2', status: '1', brand: '5', carSeries: ['13', '15', '16'], provinceCode: '44', cityCode: '440600', district: '禅城区', afterSaleTel: '0757-83121234', email: 'fs_chancheng@dongfeng-nissan.com', address: '季华五路28号万科金融中心', longitude: '113.1115', latitude: '23.0177' },
        8: { name: '苏州东风日产吴中店', code: 'DFN_SU_WZ_001', type: '2', status: '1', brand: '5', carSeries: ['13', '14', '15'], provinceCode: '32', cityCode: '320500', district: '吴中区', afterSaleTel: '0512-65121234', email: 'su_wuzhong@dongfeng-nissan.com', address: '苏雅路308号信投大厦', longitude: '120.6357', latitude: '31.2645' },
        9: { name: '杭州东风日产西湖店', code: 'DFN_HZ_XH_001', type: '1', status: '1', brand: '5', carSeries: ['14', '15', '16'], provinceCode: '33', cityCode: '330100', district: '西湖区', afterSaleTel: '0571-87981234', email: 'hz_xihu@dongfeng-nissan.com', address: '天目山路218号第一世界广场', longitude: '120.1338', latitude: '30.2722' }
      };
      var data = storeData[id];
      if (data) {
        title.textContent = '编辑门店';
        document.getElementById('storeDealerName').value = data.name;
        document.getElementById('storeDealerCode').value = data.code;
        document.getElementById('storeDealerCode').readOnly = true;
        document.getElementById('storeDealerCode').style.background = 'var(--gray-100)';
        document.getElementById('storeDealerType').value = data.type;
        document.getElementById('storeStatus').value = data.status;
        document.getElementById('storeBrand').value = data.brand;
        document.getElementById('storeProvinceSelect').value = data.provinceCode;
        onStoreProvinceChange(data.provinceCode);  // 触发省份联动
        setTimeout(function() {
          document.getElementById('storeCitySelect').value = data.cityCode;
          onStoreCityChange(data.cityCode);  // 触发城市联动
          setTimeout(function() {
            document.getElementById('storeDistrictSelect').value = data.district;
          }, 50);
        }, 50);
        document.getElementById('storeAfterSaleTel').value = data.afterSaleTel;
        document.getElementById('storeEmail').value = data.email;
        document.getElementById('storeAddress').value = data.address;
        document.getElementById('storeLongitude').value = data.longitude;
        document.getElementById('storeLatitude').value = data.latitude;
        // 联动填充大区、小区选项
        onStoreBrandChange(data.brand);
        // 延迟设置车系回显（从 seriesDealerRelation 中获取）
        setTimeout(function() {
          // 从关联关系表获取该门店关联的车系
          var relatedSeries = getDealerSeries(String(id));
          if (relatedSeries.length > 0) {
            storeSelectedSeries = relatedSeries;
          } else if (data.carSeries && data.carSeries.length > 0) {
            // 兼容旧数据
            storeSelectedSeries = data.carSeries;
          }
          initStoreSeriesSelector();
        }, 100);
      }
    } else {
      // 新增模式
      title.textContent = '新增门店';
      document.getElementById('storeDealerCode').readOnly = false;
      document.getElementById('storeDealerCode').style.background = '';
    }
    
    openModal('storeModal');
  }
  
  function onStoreBrandChange(brandId) {
    var regionSelect = document.getElementById('storeRegion');
    var subRegionSelect = document.getElementById('storeSubRegion');
    
    regionSelect.innerHTML = '<option value="">请选择大区</option>';
    subRegionSelect.innerHTML = '<option value="">请选择小区</option>';
    
    if (!brandId) return;
    
    var brandRegionMap = {
      '1': {
        regions: {
          '华南大区': ['深圳小区', '广州小区', '东莞小区', '佛山小区'],
          '华东大区': ['上海小区', '杭州小区', '南京小区', '苏州小区'],
          '华北大区': ['北京小区', '天津小区', '石家庄小区']
        }
      },
      '2': {
        regions: {
          '华南大区': ['深圳小区', '广州小区', '东莞小区'],
          '华东大区': ['上海小区', '杭州小区', '南京小区']
        }
      },
      '3': {
        regions: {
          '华南大区': ['深圳小区', '广州小区', '佛山小区'],
          '华东大区': ['上海小区', '杭州小区'],
          '西南大区': ['成都小区', '重庆小区', '昆明小区']
        }
      },
      '5': {
        regions: {
          '华南大区': ['广州小区', '深圳小区', '佛山小区'],
          '华东大区': ['上海小区', '苏州小区', '杭州小区']
        }
      }
    };
    
    var brand = brandRegionMap[brandId];
    if (brand && brand.regions) {
      Object.keys(brand.regions).forEach(function(r) {
        var opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        regionSelect.appendChild(opt);
      });
    }
  }
  
  function onStoreRegionChange(regionName) {
    var subRegionSelect = document.getElementById('storeSubRegion');
    var brandSelect = document.getElementById('storeBrand');
    
    subRegionSelect.innerHTML = '<option value="">请选择小区</option>';
    
    if (!regionName) return;
    
    var brandId = brandSelect.value;
    
    var brandRegionMap = {
      '1': {
        regions: {
          '华南大区': ['深圳小区', '广州小区', '东莞小区', '佛山小区'],
          '华东大区': ['上海小区', '杭州小区', '南京小区', '苏州小区'],
          '华北大区': ['北京小区', '天津小区', '石家庄小区']
        }
      },
      '2': {
        regions: {
          '华南大区': ['深圳小区', '广州小区', '东莞小区'],
          '华东大区': ['上海小区', '杭州小区', '南京小区']
        }
      },
      '3': {
        regions: {
          '华南大区': ['深圳小区', '广州小区', '佛山小区'],
          '华东大区': ['上海小区', '杭州小区'],
          '西南大区': ['成都小区', '重庆小区', '昆明小区']
        }
      },
      '5': {
        regions: {
          '华南大区': ['广州小区', '深圳小区', '佛山小区'],
          '华东大区': ['上海小区', '苏州小区', '杭州小区']
        }
      }
    };
    
    var brand = brandRegionMap[brandId];
    if (brand && brand.regions && brand.regions[regionName]) {
      brand.regions[regionName].forEach(function(sr) {
        var opt = document.createElement('option');
        opt.value = sr;
        opt.textContent = sr;
        subRegionSelect.appendChild(opt);
      });
    }
  }

  // ==================== 门店关联车系功能（多选标签） ====================
  // 车系数据（来源：车系管理）
  var carSeriesData = {
    '1': [  // 理想汽车
      { id: '1', name: '理想L9', code: 'LIXIANG_L9' },
      { id: '2', name: '理想L8', code: 'LIXIANG_L8' },
      { id: '5', name: '理想L7', code: 'LIXIANG_L7' },
      { id: '6', name: '理想L6', code: 'LIXIANG_L6' },
      { id: '7', name: '理想MEGA', code: 'LIXIANG_MEGA' }
    ],
    '2': [  // 问界
      { id: '3', name: '问界M9', code: 'WENJIE_M9' },
      { id: '8', name: '问界M7', code: 'WENJIE_M7' },
      { id: '9', name: '问界M5', code: 'WENJIE_M5' }
    ],
    '3': [  // 小鹏汽车
      { id: '4', name: '小鹏G9', code: 'XIAOPENG_G9' },
      { id: '10', name: '小鹏G6', code: 'XIAOPENG_G6' },
      { id: '11', name: '小鹏P7', code: 'XIAOPENG_P7' },
      { id: '12', name: '小鹏P5', code: 'XIAOPENG_P5' }
    ],
    '5': [  // 东风日产
      { id: '13', name: '轩逸', code: 'DFN_SYLPHY' },
      { id: '14', name: '天籁', code: 'DFN_ALTIMA' },
      { id: '15', name: '逍客', code: 'DFN_QASHQAI' },
      { id: '16', name: '新楼兰', code: 'DFN_MURANO' }
    ]
  };

  // ==================== 车系-门店关联关系表 ====================
  // 存储格式：{ seriesId: [dealerId1, dealerId2, ...], ... }
  // 车系和门店是多对多关系
  var seriesDealerRelation = {
    // 理想L9
    '1': ['d1', 'd2', 'd5'],
    // 理想L8
    '2': ['d1', 'd3'],
    // 理想L7
    '5': ['d2', 'd4'],
    // 理想L6
    '6': ['d1', 'd2', 'd3'],
    // 理想MEGA
    '7': ['d5'],
    // 问界M9
    '3': ['d6', 'd7'],
    // 问界M7
    '8': ['d6'],
    // 问界M5
    '9': ['d7', 'd8'],
    // 小鹏G9
    '4': ['d9', 'd10'],
    // 小鹏G6
    '10': ['d9'],
    // 小鹏P7
    '11': ['d10'],
    // 小鹏P5
    '12': ['d9', 'd10'],
    // 轩逸
    '13': ['d11', 'd12'],
    // 天籁
    '14': ['d11', 'd13'],
    // 逍客
    '15': ['d12'],
    // 新楼兰
    '16': ['d13']
  };

  // 门店数据（用于关联车系列表展示）
  var dealerData = {
    'd1': { id: 'd1', name: '理想汽车·深圳南山店', code: 'LIXIANG_SZ_NS_001', brandId: '1' },
    'd2': { id: 'd2', name: '理想汽车·深圳福田店', code: 'LIXIANG_SZ_FT_002', brandId: '1' },
    'd3': { id: 'd3', name: '理想汽车·广州天河店', code: 'LIXIANG_GZ_TH_003', brandId: '1' },
    'd4': { id: 'd4', name: '理想汽车·东莞南城店', code: 'LIXIANG_DG_NC_004', brandId: '1' },
    'd5': { id: 'd5', name: '理想汽车·上海浦东店', code: 'LIXIANG_SH_PD_005', brandId: '1' },
    'd6': { id: 'd6', name: '问界·深圳福田店', code: 'WENJIE_SZ_FT_001', brandId: '2' },
    'd7': { id: 'd7', name: '问界·深圳宝安店', code: 'WENJIE_SZ_BA_002', brandId: '2' },
    'd8': { id: 'd8', name: '问界·广州天河店', code: 'WENJIE_GZ_TH_003', brandId: '2' },
    'd9': { id: 'd9', name: '小鹏汽车·深圳南山店', code: 'XIAOPENG_SZ_NS_001', brandId: '3' },
    'd10': { id: 'd10', name: '小鹏汽车·广州天河店', code: 'XIAOPENG_GZ_TH_002', brandId: '3' },
    'd11': { id: 'd11', name: '东风日产·广州番禺店', code: 'DFN_GZ_PY_001', brandId: '5' },
    'd12': { id: 'd12', name: '东风日产·深圳南山店', code: 'DFN_SZ_NS_002', brandId: '5' },
    'd13': { id: 'd13', name: '东风日产·上海浦东店', code: 'DFN_SH_PD_003', brandId: '5' }
  };

  // ==================== 双向联动核心函数 ====================

  // 获取某个车系关联的所有门店ID
  function getSeriesDealers(seriesId) {
    return seriesDealerRelation[seriesId] || [];
  }

  // 获取某个门店关联的所有车系ID
  function getDealerSeries(dealerId) {
    var result = [];
    for (var sid in seriesDealerRelation) {
      if (seriesDealerRelation[sid].indexOf(dealerId) !== -1) {
        result.push(sid);
      }
    }
    return result;
  }

  // 为车系列表添加关联专营店
  function addDealerToSeries(seriesId, dealerId) {
    if (!seriesDealerRelation[seriesId]) {
      seriesDealerRelation[seriesId] = [];
    }
    if (seriesDealerRelation[seriesId].indexOf(dealerId) === -1) {
      seriesDealerRelation[seriesId].push(dealerId);
    }
  }

  // 为车系列表移除关联专营店
  function removeDealerFromSeries(seriesId, dealerId) {
    if (seriesDealerRelation[seriesId]) {
      var idx = seriesDealerRelation[seriesId].indexOf(dealerId);
      if (idx !== -1) {
        seriesDealerRelation[seriesId].splice(idx, 1);
      }
    }
  }

  // ==================== 门店管理-关联车系相关函数 ====================
  // 门店管理中已选的车系ID数组
  var storeSelectedSeries = [];

  // 初始化门店的车系选择器（在打开门店弹窗时调用）
  function initStoreSeriesSelector() {
    var brandId = document.getElementById('storeBrand').value;
    var listContainer = document.getElementById('storeSeriesList');
    if (!brandId) {
      document.getElementById('storeSelectedSeries').innerHTML = '';
      document.getElementById('storeSelectedSeriesEmpty').style.display = 'block';
      listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-400); font-size: 13px;">请先选择所属品牌</div>';
      document.getElementById('storeSeriesTotalCount').textContent = '0';
      document.getElementById('storeSeriesSelectedCount').textContent = '0';
      document.getElementById('storeSeriesSelectAll').checked = false;
      document.getElementById('storeSeriesSelectAll').indeterminate = false;
      listContainer.style.display = 'none';
      return;
    }
    renderStoreSeriesList();
    updateStoreSelectedSeriesDisplay();
    listContainer.style.display = 'block';
  }

  // 品牌变更时更新门店的车系列表
  function onStoreBrandChangeForSeries() {
    var brandId = document.getElementById('storeBrand').value;
    var listContainer = document.getElementById('storeSeriesList');
    // 清空已选车系
    storeSelectedSeries = [];
    // 重新渲染
    if (brandId) {
      renderStoreSeriesList();
      updateStoreSelectedSeriesDisplay();
      listContainer.style.display = 'block';
    } else {
      document.getElementById('storeSelectedSeries').innerHTML = '';
      document.getElementById('storeSelectedSeriesEmpty').style.display = 'block';
      listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-400); font-size: 13px;">请先选择所属品牌</div>';
      document.getElementById('storeSeriesTotalCount').textContent = '0';
      document.getElementById('storeSeriesSelectedCount').textContent = '0';
      listContainer.style.display = 'none';
    }
    // 清空搜索框
    document.getElementById('storeSeriesSearch').value = '';
  }

  // 搜索车系
  function filterStoreSeries() {
    renderStoreSeriesList();
  }

  // 获取过滤后的车系数据
  function getFilteredStoreSeries() {
    var brandId = document.getElementById('storeBrand').value;
    if (!brandId) return [];
    
    var seriesList = carSeriesData[brandId] || [];
    var keyword = document.getElementById('storeSeriesSearch').value.trim().toLowerCase();
    
    if (keyword) {
      seriesList = seriesList.filter(function(series) {
        return series.name.toLowerCase().indexOf(keyword) !== -1 || 
               series.code.toLowerCase().indexOf(keyword) !== -1;
      });
    }
    
    return seriesList;
  }

  // 渲染车系列表
  function renderStoreSeriesList() {
    var seriesList = getFilteredStoreSeries();
    var listContainer = document.getElementById('storeSeriesList');
    var emptyDiv = document.getElementById('storeSeriesEmpty');
    
    if (seriesList.length === 0) {
      listContainer.innerHTML = '';
      emptyDiv.style.display = 'block';
    } else {
      emptyDiv.style.display = 'none';
      var html = '';
      seriesList.forEach(function(series) {
        var isChecked = storeSelectedSeries.indexOf(series.id) !== -1;
        var checkedAttr = isChecked ? 'checked' : '';
        html += '<div style="padding: 8px 12px; cursor: pointer; display: flex; align-items: flex-start; gap: 8px;" ';
        html += 'onmouseover="this.style.background=\'var(--gray-50)\'" ';
        html += 'onmouseout="this.style.background=\'transparent\'" ';
        html += 'onclick="toggleStoreSeries(this, \'' + series.id + '\')">';
        html += '<input type="checkbox" ' + checkedAttr + ' style="width: 16px; height: 16px; margin-top: 2px; cursor: pointer; flex-shrink: 0;" ';
        html += 'onclick="event.stopPropagation(); toggleStoreSeries(this, \'' + series.id + '\')">';
        html += '<div style="flex: 1;">';
        html += '<div style="font-size: 14px; color: var(--gray-800);">' + (isChecked ? '✓ ' : '') + series.name + '</div>';
        html += '<div style="font-size: 12px; color: var(--gray-400);">' + series.code + '</div>';
        html += '</div></div>';
      });
      listContainer.innerHTML = html;
    }
    
    // 更新计数
    document.getElementById('storeSeriesTotalCount').textContent = seriesList.length;
    updateStoreSeriesSelectedCount();
    updateStoreSeriesSelectAllState();
  }

  // 更新全选checkbox状态
  function updateStoreSeriesSelectAllState() {
    var seriesList = getFilteredStoreSeries();
    var selectedCount = 0;
    seriesList.forEach(function(series) {
      if (storeSelectedSeries.indexOf(series.id) !== -1) {
        selectedCount++;
      }
    });
    
    var selectAllCheckbox = document.getElementById('storeSeriesSelectAll');
    selectAllCheckbox.checked = (selectedCount > 0 && selectedCount === seriesList.length);
    selectAllCheckbox.indeterminate = (selectedCount > 0 && selectedCount < seriesList.length);
  }

  // 全选/取消全选
  function toggleStoreSeriesSelectAll() {
    var seriesList = getFilteredStoreSeries();
    var selectAllCheckbox = document.getElementById('storeSeriesSelectAll');
    
    if (selectAllCheckbox.checked) {
      // 全选
      seriesList.forEach(function(series) {
        if (storeSelectedSeries.indexOf(series.id) === -1) {
          storeSelectedSeries.push(series.id);
        }
      });
    } else {
      // 取消全选
      var seriesIds = seriesList.map(function(s) { return s.id; });
      storeSelectedSeries = storeSelectedSeries.filter(function(id) {
        return seriesIds.indexOf(id) === -1;
      });
    }
    
    renderStoreSeriesList();
    updateStoreSelectedSeriesDisplay();
  }

  // 切换单个车系选中状态（双向联动）
  function toggleStoreSeries(checkboxElem, seriesId) {
    // 如果直接点击 checkbox，需要先更新 storeSelectedSeries
    var isChecked = checkboxElem.checked;
    
    var index = storeSelectedSeries.indexOf(seriesId);
    if (isChecked && index === -1) {
      storeSelectedSeries.push(seriesId);
      // 双向联动：同步更新 seriesDealerRelation
      if (currentEditingStoreId) {
        syncSeriesToDealer(String(currentEditingStoreId), seriesId, true);
      }
    } else if (!isChecked && index !== -1) {
      storeSelectedSeries.splice(index, 1);
      // 双向联动：同步更新 seriesDealerRelation
      if (currentEditingStoreId) {
        syncSeriesToDealer(String(currentEditingStoreId), seriesId, false);
      }
    }
    
    renderStoreSeriesList();
    updateStoreSelectedSeriesDisplay();
  }

  // 更新已选计数
  function updateStoreSeriesSelectedCount() {
    var seriesList = getFilteredStoreSeries();
    var selectedCount = 0;
    seriesList.forEach(function(series) {
      if (storeSelectedSeries.indexOf(series.id) !== -1) {
        selectedCount++;
      }
    });
    document.getElementById('storeSeriesSelectedCount').textContent = selectedCount;
  }

  // 更新已选车系标签显示
  function updateStoreSelectedSeriesDisplay() {
    var container = document.getElementById('storeSelectedSeries');
    var emptyDiv = document.getElementById('storeSelectedSeriesEmpty');
    
    if (storeSelectedSeries.length === 0) {
      container.innerHTML = '';
      emptyDiv.style.display = 'block';
      return;
    }
    
    emptyDiv.style.display = 'none';
    var html = '';
    storeSelectedSeries.forEach(function(seriesId) {
      // 在所有品牌中查找车系名称
      var seriesName = '';
      for (var brandId in carSeriesData) {
        var found = carSeriesData[brandId].find(function(s) { return s.id === seriesId; });
        if (found) {
          seriesName = found.name;
          break;
        }
      }
      html += '<span class="status-badge status-primary" style="font-size: 12px; padding: 4px 8px;">' + seriesName + ' <span style="cursor: pointer; margin-left: 4px; font-weight: bold;" onclick="removeStoreSeries(\'' + seriesId + '\')">×</span></span>';
    });
    container.innerHTML = html;
  }

  // 移除单个车系
  function removeStoreSeries(seriesId) {
    var index = storeSelectedSeries.indexOf(seriesId);
    if (index !== -1) {
      storeSelectedSeries.splice(index, 1);
    }
    renderStoreSeriesList();
    updateStoreSelectedSeriesDisplay();
  }

  // 清空所有已选车系
  function clearStoreSelectedSeries() {
    storeSelectedSeries = [];
    renderStoreSeriesList();
    updateStoreSelectedSeriesDisplay();
  }

  // 重置门店弹窗的车系选择器
  function resetStoreModalSeries() {
    storeSelectedSeries = [];
    document.getElementById('storeSeriesSearch').value = '';
    document.getElementById('storeSeriesSelectAll').checked = false;
    document.getElementById('storeSeriesSelectAll').indeterminate = false;
    updateStoreSelectedSeriesDisplay();
  }

  // ==================== 双向联动核心逻辑 ====================
  // 当前正在编辑的车系ID（用于双向联动）
  var currentEditingSeriesId = null;
  // 当前正在编辑的门店ID（用于双向联动）
  var currentEditingStoreId = null;

  // 在车系管理中修改关联专营店时，同步更新门店的关联车系
  function syncDealerToSeries(seriesId, dealerId, isAdd) {
    if (isAdd) {
      addDealerToSeries(seriesId, dealerId);
    } else {
      removeDealerFromSeries(seriesId, dealerId);
    }
  }

  // 在门店管理中修改关联车系时，同步更新车系的关联专营店
  function syncSeriesToDealer(dealerId, seriesId, isAdd) {
    if (isAdd) {
      addDealerToSeries(seriesId, dealerId);
    } else {
      removeDealerFromSeries(seriesId, dealerId);
    }
  }

  // 已选车系列表（用于多选）
  var selectedCarSeries = [];

  // 点击其他区域关闭车系下拉面板
  document.addEventListener('click', function(e) {
    var dropdown = document.getElementById('carSeriesDropdown');
    var selector = document.getElementById('carSeriesSelector');
    if (dropdown && selector && dropdown.style.display === 'block') {
      if (!selector.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    }
  });

  // 切换车系下拉面板
  function toggleCarSeriesDropdown() {
    var dropdown = document.getElementById('carSeriesDropdown');
    var brandId = document.getElementById('storeBrand').value;
    
    if (!brandId) {
      showToast('请先选择所属品牌', 'warning');
      return;
    }
    
    if (dropdown.style.display === 'none') {
      // 显示下拉面板
      updateCarSeriesDropdown(brandId);
      dropdown.style.display = 'block';
    } else {
      // 隐藏下拉面板
      dropdown.style.display = 'none';
    }
  }

  // 切换门店车系下拉面板（门店弹窗专用）
  function toggleStoreSeriesDropdown() {
    var listContainer = document.getElementById('storeSeriesList');
    var brandId = document.getElementById('storeBrand').value;
    
    if (!brandId) {
      showToast('请先选择所属品牌', 'warning');
      return;
    }
    
    if (listContainer.style.display === 'none' || listContainer.style.display === '') {
      // 显示车系列表
      renderStoreSeriesList();
      listContainer.style.display = 'block';
    } else {
      // 隐藏车系列表
      listContainer.style.display = 'none';
    }
  }

  // 更新车系下拉选项
  function updateCarSeriesDropdown(brandId) {
    var optionsContainer = document.getElementById('carSeriesOptions');
    var seriesList = carSeriesData[brandId] || [];
    
    if (seriesList.length === 0) {
      optionsContainer.innerHTML = '<div style="padding: 12px; text-align: center; color: #999;">该品牌暂无可用车系</div>';
      return;
    }
    
    var html = '';
    seriesList.forEach(function(series) {
      var isSelected = selectedCarSeries.indexOf(series.id) !== -1;
      var checkIcon = isSelected ? '✓ ' : '';
      var bgStyle = isSelected ? 'background: var(--primary-light); color: var(--primary);' : '';
      html += '<div class="car-series-option" style="padding: 10px 16px; cursor: pointer; ' + bgStyle + '" ';
      html += 'onclick="toggleCarSeries(\'' + series.id + '\', \'' + series.name + '\')" ';
      html += 'onmouseover="this.style.background=\'#f5f5f5\'" ';
      html += 'onmouseout="this.style.background=\'' + (isSelected ? 'var(--primary-light)' : '#fff') + '\'">';
      html += '<span style="color: var(--gray-400); margin-right: 8px;">' + checkIcon + '</span>';
      html += series.name + ' <span style="color: var(--gray-400); font-size: 12px;">(' + series.code + ')</span>';
      html += '</div>';
    });
    optionsContainer.innerHTML = html;
  }

  // 切换车系选中状态
  function toggleCarSeries(seriesId, seriesName) {
    var index = selectedCarSeries.indexOf(seriesId);
    
    if (index === -1) {
      // 选中
      selectedCarSeries.push(seriesId);
    } else {
      // 取消选中
      selectedCarSeries.splice(index, 1);
    }
    
    // 更新隐藏字段值
    document.getElementById('storeCarSeries').value = selectedCarSeries.join(',');
    
    // 更新标签显示
    updateCarSeriesTags();
    
    // 刷新下拉选项状态
    var brandId = document.getElementById('storeBrand').value;
    updateCarSeriesDropdown(brandId);
  }

  // 更新已选车系标签显示
  function updateCarSeriesTags() {
    var tagsContainer = document.getElementById('carSeriesTags');
    var placeholder = document.getElementById('carSeriesPlaceholder');
    var brandId = document.getElementById('storeBrand').value;
    
    if (selectedCarSeries.length === 0) {
      tagsContainer.innerHTML = '<span id="carSeriesPlaceholder" style="color: var(--gray-400); font-size: 14px;">' + (brandId ? '请选择车系（支持多选）' : '请先选择所属品牌') + '</span>';
      return;
    }
    
    var html = '';
    var brandData = carSeriesData[brandId] || {};
    selectedCarSeries.forEach(function(seriesId) {
      // 查找车系名称
      var seriesList = carSeriesData[brandId] || [];
      var series = seriesList.find(function(s) { return s.id === seriesId; });
      var name = series ? series.name : seriesId;
      
      html += '<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--primary-light); color: var(--primary); border-radius: 4px; font-size: 13px;">';
      html += name;
      html += '<span onclick="removeCarSeries(\'' + seriesId + '\'); event.stopPropagation();" style="cursor: pointer; margin-left: 2px; font-weight: bold;">×</span>';
      html += '</span>';
    });
    
    // 添加清空按钮
    html += '<span onclick="clearAllCarSeries(); event.stopPropagation();" style="padding: 4px 8px; background: var(--gray-100); color: var(--gray-500); border-radius: 4px; font-size: 12px; cursor: pointer;">清空所选</span>';
    
    tagsContainer.innerHTML = html;
  }

  // 移除单个车系
  function removeCarSeries(seriesId) {
    var index = selectedCarSeries.indexOf(seriesId);
    if (index !== -1) {
      selectedCarSeries.splice(index, 1);
      document.getElementById('storeCarSeries').value = selectedCarSeries.join(',');
      updateCarSeriesTags();
      var brandId = document.getElementById('storeBrand').value;
      updateCarSeriesDropdown(brandId);
    }
  }

  // 清空所有已选车系
  function clearAllCarSeries() {
    selectedCarSeries = [];
    document.getElementById('storeCarSeries').value = '';
    updateCarSeriesTags();
    var brandId = document.getElementById('storeBrand').value;
    updateCarSeriesDropdown(brandId);
  }

  // 同步更新品牌和大区、小区、车系
  function onStoreBrandChange(brandId) {
    var regionSelect = document.getElementById('storeRegion');
    var subRegionSelect = document.getElementById('storeSubRegion');
    
    regionSelect.innerHTML = '<option value="">请选择大区</option>';
    subRegionSelect.innerHTML = '<option value="">请选择小区</option>';
    
    if (!brandId) return;
    
    var brandRegionMap = {
      '1': {
        regions: {
          '华南大区': ['深圳小区', '广州小区', '东莞小区', '佛山小区'],
          '华东大区': ['上海小区', '杭州小区', '南京小区', '苏州小区'],
          '华北大区': ['北京小区', '天津小区', '石家庄小区']
        }
      },
      '2': {
        regions: {
          '华南大区': ['深圳小区', '广州小区', '东莞小区'],
          '华东大区': ['上海小区', '杭州小区', '南京小区']
        }
      },
      '3': {
        regions: {
          '华南大区': ['深圳小区', '广州小区', '佛山小区'],
          '华东大区': ['上海小区', '杭州小区'],
          '西南大区': ['成都小区', '重庆小区', '昆明小区']
        }
      }
    };
    
    var brand = brandRegionMap[brandId];
    if (brand && brand.regions) {
      Object.keys(brand.regions).forEach(function(r) {
        var opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        regionSelect.appendChild(opt);
      });
    }
    
    // 同时更新车系列表
    onStoreBrandChangeForSeries();
  }

  // ==================== 地图选址功能 ====================
  var mapPickerData = {
    longitude: '',
    latitude: '',
    address: ''
  };
  
  // 模拟地址搜索数据
  var addressDatabase = [
    { address: '深圳市南山区科苑南路', lng: 113.9438, lat: 22.5484, name: '深圳市南山区' },
    { address: '深圳市福田区深南大道', lng: 114.0579, lat: 22.5484, name: '福田区' },
    { address: '深圳市罗湖区东门中路', lng: 114.1319, lat: 22.5484, name: '罗湖区' },
    { address: '广州市天河区天河路', lng: 113.3614, lat: 23.1325, name: '天河区' },
    { address: '广州市越秀区中山五路', lng: 113.2644, lat: 23.1256, name: '越秀区' },
    { address: '上海市浦东新区世纪大道', lng: 121.5441, lat: 31.2208, name: '浦东新区' },
    { address: '上海市黄浦区南京东路', lng: 121.4844, lat: 31.2350, name: '黄浦区' },
    { address: '北京市朝阳区建国路', lng: 116.4636, lat: 39.9086, name: '朝阳区' },
    { address: '北京市海淀区中关村大街', lng: 116.3124, lat: 39.9886, name: '海淀区' },
    { address: '北京市西城区西单北大街', lng: 116.3744, lat: 39.9156, name: '西城区' }
  ];
  
  function openMapPicker() {
    // 读取当前已有的经纬度
    var currentLng = document.getElementById('storeLongitude').value;
    var currentLat = document.getElementById('storeLatitude').value;
    
    mapPickerData.longitude = currentLng;
    mapPickerData.latitude = currentLat;
    mapPickerData.address = '';
    
    // 清空搜索结果
    document.getElementById('mapSearchResults').innerHTML = '<div style="padding: 20px; text-align: center; color: #999;"><p style="margin: 0; font-size: 13px;">输入地址搜索<br>或直接点击地图选点</p></div>';
    document.getElementById('selectedLocation').style.display = 'none';
    document.getElementById('mapSearchInput').value = '';
    
    openModal('mapPickerModal');
  }
  
  function searchMapAddress() {
    var keyword = document.getElementById('mapSearchInput').value.trim();
    if (!keyword) {
      showToast('请输入搜索地址', 'error');
      return;
    }
    
    // 模拟搜索
    var results = addressDatabase.filter(function(item) {
      return item.address.indexOf(keyword) !== -1 || item.name.indexOf(keyword) !== -1;
    });
    
    var resultsContainer = document.getElementById('mapSearchResults');
    
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;"><p style="margin: 0 0 8px 0;">😕</p><p style="margin: 0; font-size: 13px;">未找到相关地址<br>请尝试其他关键词</p></div>';
      return;
    }
    
    var html = '<div style="padding: 12px 16px; background: #f5f5f5; font-size: 12px; color: #666;">找到 ' + results.length + ' 个结果</div>';
    results.forEach(function(item, index) {
      html += '<div class="map-result-item" onclick="selectMapResult(' + index + ')" data-index="' + index + '" style="padding: 12px 16px; border-bottom: 1px solid #eee; cursor: pointer;">';
      html += '<div style="font-size: 14px; color: #333;">' + item.address + '</div>';
      html += '<div style="font-size: 12px; color: #999; margin-top: 4px;">' + item.lng + ', ' + item.lat + '</div>';
      html += '</div>';
    });
    
    // 保存搜索结果供选择使用
    window.mapSearchResults = results;
    
    resultsContainer.innerHTML = html;
  }
  
  function selectMapResult(index) {
    var item = window.mapSearchResults[index];
    if (!item) return;
    
    mapPickerData.longitude = item.lng.toFixed(4);
    mapPickerData.latitude = item.lat.toFixed(4);
    mapPickerData.address = item.address;
    
    // 更新UI
    document.getElementById('selectedAddress').textContent = item.address;
    document.getElementById('selectedCoords').textContent = '经度: ' + item.lng.toFixed(4) + '  纬度: ' + item.lat.toFixed(4);
    document.getElementById('selectedLocation').style.display = 'block';
    
    // 高亮选中项
    document.querySelectorAll('.map-result-item').forEach(function(el) {
      el.style.background = '';
    });
    document.querySelector('.map-result-item[data-index="' + index + '"]').style.background = '#e8f5e9';
    
    showToast('已选择位置: ' + item.address, 'success');
  }
  
  function confirmMapLocation() {
    if (!mapPickerData.longitude || !mapPickerData.latitude) {
      showToast('请先选择位置', 'error');
      return;
    }
    
    // 填写经纬度到表单
    document.getElementById('storeLongitude').value = mapPickerData.longitude;
    document.getElementById('storeLatitude').value = mapPickerData.latitude;
    
    closeModal('mapPickerModal');
    showToast('经纬度已填充', 'success');
  }
  
  // 地图点击事件
  document.addEventListener('DOMContentLoaded', function() {
    var mapContainer = document.getElementById('mapContainer');
    if (mapContainer) {
      mapContainer.addEventListener('click', function(e) {
        // 模拟点击地图随机生成位置
        var rect = mapContainer.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        
        // 根据点击位置计算模拟的经纬度
        // 基准点：深圳市 (113.9-114.5, 22.4-22.9)
        var baseLng = 113.9 + (x / rect.width) * 0.6;
        var baseLat = 22.4 + ((rect.height - y) / rect.height) * 0.5;
        
        mapPickerData.longitude = baseLng.toFixed(4);
        mapPickerData.latitude = baseLat.toFixed(4);
        mapPickerData.address = '地图选点位置';
        
        document.getElementById('selectedAddress').textContent = '地图选点位置 (可编辑)';
        document.getElementById('selectedCoords').textContent = '经度: ' + mapPickerData.longitude + '  纬度: ' + mapPickerData.latitude;
        document.getElementById('selectedLocation').style.display = 'block';
      });
    }
  });

  // ==================== 省市区三级联动数据 ====================
  var provinceCityMap = {
    '44': {
      name: '广东省',
      cities: {
        '440300': { name: '深圳市', districts: ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区', '龙华区', '坪山区', '光明区', '大鹏新区'] },
        '440100': { name: '广州市', districts: ['天河区', '越秀区', '海珠区', '白云区', '番禺区', '黄埔区', '花都区', '南沙区', '从化区', '增城区'] },
        '440400': { name: '珠海市', districts: ['香洲区', '斗门区', '金湾区'] },
        '441900': { name: '东莞市', districts: ['莞城区', '南城区', '东城区', '万江区', '石碣镇', '石龙镇'] }
      }
    },
    '31': {
      name: '上海市',
      cities: {
        '310000': { name: '上海市', districts: ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区'] }
      }
    },
    '11': {
      name: '北京市',
      cities: {
        '110000': { name: '北京市', districts: ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区'] }
      }
    },
    '33': {
      name: '浙江省',
      cities: {
        '330100': { name: '杭州市', districts: ['上城区', '下城区', '西湖区', '拱墅区', '江干区', '滨江区', '萧山区', '余杭区', '临平区', '钱塘区', '富阳区', '临安区'] },
        '330200': { name: '宁波市', districts: ['海曙区', '江北区', '北仑区', '镇海区', '鄞州区', '奉化区', '余姚市', '慈溪市'] },
        '330300': { name: '温州市', districts: ['鹿城区', '龙湾区', '瓯海区', '洞头区', '瑞安市', '乐清市', '永嘉县'] }
      }
    },
    '32': {
      name: '江苏省',
      cities: {
        '320100': { name: '南京市', districts: ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区', '雨花台区', '江宁区', '六合区', '溧水区', '高淳区'] },
        '320500': { name: '苏州市', districts: ['姑苏区', '虎丘区', '吴中区', '相城区', '吴江区', '工业园区', '高新区'] },
        '320200': { name: '无锡市', districts: ['梁溪区', '锡山区', '惠山区', '滨湖区', '新吴区', '江阴市', '宜兴市'] }
      }
    }
  };

  function onStoreProvinceChange(provinceCode) {
    var citySelect = document.getElementById('storeCitySelect');
    var districtSelect = document.getElementById('storeDistrictSelect');
    
    citySelect.innerHTML = '<option value="">市</option>';
    districtSelect.innerHTML = '<option value="">区/县</option>';
    
    if (!provinceCode) return;
    
    var province = provinceCityMap[provinceCode];
    if (province && province.cities) {
      Object.keys(province.cities).forEach(function(cityCode) {
        var city = province.cities[cityCode];
        var opt = document.createElement('option');
        opt.value = cityCode;
        opt.textContent = city.name;
        citySelect.appendChild(opt);
      });
    }
  }
  
  function onStoreCityChange(cityCode) {
    var provinceSelect = document.getElementById('storeProvinceSelect');
    var districtSelect = document.getElementById('storeDistrictSelect');
    
    districtSelect.innerHTML = '<option value="">区/县</option>';
    
    if (!cityCode) return;
    
    var provinceCode = provinceSelect.value;
    var province = provinceCityMap[provinceCode];
    
    if (province && province.cities && province.cities[cityCode]) {
      var city = province.cities[cityCode];
      if (city.districts) {
        city.districts.forEach(function(district) {
          var opt = document.createElement('option');
          opt.value = district;
          opt.textContent = district;
          districtSelect.appendChild(opt);
        });
      }
    }
  }
  
  function saveStoreData() {
    var name = document.getElementById('storeDealerName').value.trim();
    var code = document.getElementById('storeDealerCode').value.trim();
    var type = document.getElementById('storeDealerType').value;
    var brand = document.getElementById('storeBrand').value;
    var carSeries = document.getElementById('storeCarSeries').value;  // 逗号分隔的ID字符串
    var province = document.getElementById('storeProvinceSelect').value;
    var city = document.getElementById('storeCitySelect').value;
    
    if (!name) {
      showToast('请输入经销商名称', 'error');
      return;
    }
    if (!code) {
      showToast('请输入经销商编码', 'error');
      return;
    }
    if (!type) {
      showToast('请选择门店类型', 'error');
      return;
    }
    if (!brand) {
      showToast('请选择所属品牌', 'error');
      return;
    }
    if (!carSeries) {
      showToast('请选择关联车系', 'error');
      return;
    }
    if (!province) {
      showToast('请选择所在省份', 'error');
      return;
    }
    if (!city) {
      showToast('请选择所在城市', 'error');
      return;
    }
    
    // 获取完整的地区信息
    var provinceText = document.getElementById('storeProvinceSelect').selectedOptions[0].textContent;
    var cityText = document.getElementById('storeCitySelect').selectedOptions[0].textContent;
    var district = document.getElementById('storeDistrictSelect').value;
    var districtText = district ? document.getElementById('storeDistrictSelect').selectedOptions[0].textContent : '';
    // 获取车系名称（多选）
    var carSeriesIds = carSeries.split(',');
    var carSeriesNames = carSeriesIds.map(function(id) {
      var seriesList = carSeriesData[brand] || [];
      var series = seriesList.find(function(s) { return s.id === id; });
      return series ? series.name : id;
    });
    
    closeModal('storeModal');
    showToast('门店保存成功', 'success');
  }
  
  function viewStoreDetail(id) {
    // 查看模式 - 以只读方式打开门店详情
    openStoreModal(id);
    
    // 设置为只读模式
    var modal = document.getElementById('storeModal');
    var title = document.getElementById('storeModalTitle');
    title.textContent = '查看门店';
    
    // 设置所有输入框为只读
    var inputs = modal.querySelectorAll('input[type="text"], input[type="email"], input[type="number"]');
    inputs.forEach(function(input) {
      input.readOnly = true;
      input.style.background = 'var(--gray-100)';
    });
    
    // 设置所有下拉框为禁用
    var selects = modal.querySelectorAll('select');
    selects.forEach(function(select) {
      select.disabled = true;
      select.style.background = 'var(--gray-100)';
      select.style.cursor = 'not-allowed';
    });
    
    // 隐藏车系下拉面板
    var storeSeriesList = document.getElementById('storeSeriesList');
    if (storeSeriesList) {
      storeSeriesList.style.display = 'none';
    }
    
    // 禁用车系选择器
    var storeSeriesSelector = document.getElementById('storeSeriesSelector');
    if (storeSeriesSelector) {
      storeSeriesSelector.style.cursor = 'default';
      storeSeriesSelector.style.borderColor = 'var(--gray-200)';
      storeSeriesSelector.style.background = 'var(--gray-100)';
      // 移除点击事件
      storeSeriesSelector.onclick = null;
      // 隐藏下拉箭头
      var arrow = storeSeriesSelector.querySelector('span:last-child');
      if (arrow) arrow.style.display = 'none';
    }
    
    // 禁用关联车系标签的删除功能
    var storeSelectedSeries = document.getElementById('storeSelectedSeries');
    if (storeSelectedSeries) {
      // 移除所有标签的×按钮
      var tags = storeSelectedSeries.querySelectorAll('span');
      tags.forEach(function(tag) {
        var closeBtn = tag.querySelector('span[onclick], i[class*="close"]');
        if (closeBtn) {
          closeBtn.style.display = 'none';
        }
        // 同时移除span标签的onclick
        if (tag.getAttribute('onclick')) {
          tag.setAttribute('data-original-onclick', tag.getAttribute('onclick'));
          tag.removeAttribute('onclick');
        }
      });
    }
    
    // 隐藏车系表单提示（包含可操作文字）
    var formHints = modal.querySelectorAll('.form-hint');
    formHints.forEach(function(hint) {
      if (hint.textContent.includes('点击标签') || hint.textContent.includes('支持多选')) {
        hint.style.display = 'none';
      }
    });
    
    // 隐藏地图选址按钮
    var mapBtn = modal.querySelector('button[onclick="openMapPicker()"]');
    if (mapBtn) {
      mapBtn.style.display = 'none';
    }
    
    // 隐藏保存按钮，显示仅关闭按钮
    var footer = modal.querySelector('.modal-footer');
    if (footer) {
      footer.innerHTML = '<button class="btn btn-secondary" onclick="closeStoreModalAndReset()">关闭</button>';
    }
    
    // 添加全局标志表示查看模式
    modal.dataset.viewMode = 'true';
  }
  
  // 门店删除确认弹窗
  var storeDeleteId = null;
  
  function confirmDeleteStore(id, name) {
    storeDeleteId = id;
    document.getElementById('storeDeleteName').textContent = name;
    document.getElementById('storeDeleteConfirmBtn').onclick = function() {
      deleteStore(id);
    };
    openModal('storeDeleteModal');
  }
  
  function closeStoreDeleteModal() {
    storeDeleteId = null;
    closeModal('storeDeleteModal');
  }
  
  function deleteStore(id) {
    // 模拟删除操作 - 实际项目中应调用API
    var tbody = document.querySelector('#page-store tbody');
    var rows = tbody.querySelectorAll('tr');
    rows.forEach(function(row) {
      var btn = row.querySelector('button[onclick*="confirmDeleteStore(' + id + ')"]');
      if (btn) {
        row.remove();
        showToast('门店删除成功', 'success');
      }
    });
    
    // 更新分页信息
    updateStorePaginationInfo();
    
    closeStoreDeleteModal();
  }
  
  function updateStorePaginationInfo() {
    var tbody = document.querySelector('#page-store tbody');
    var rows = tbody.querySelectorAll('tr');
    var infoEl = document.getElementById('storeSelectionInfo');
    if (infoEl) {
      var totalRows = document.querySelectorAll('#page-store tbody tr').length + 256;
      infoEl.textContent = '已选 0 / ' + rows.length + ' 条，共 ' + (256 - (3 - rows.length)) + ' 条数据';
    }
  }
  
  function closeStoreModalAndReset() {
    var modal = document.getElementById('storeModal');
    modal.dataset.viewMode = '';
    closeModal('storeModal');
    
    // 延迟恢复表单状态，确保下次打开正常
    setTimeout(function() {
      resetStoreModalForEdit();
    }, 300);
  }
  
  function resetStoreModalForEdit() {
    // 恢复所有输入框
    var modal = document.getElementById('storeModal');
    var inputs = modal.querySelectorAll('input[type="text"], input[type="email"], input[type="number"]');
    inputs.forEach(function(input) {
      input.readOnly = false;
      if (input.id !== 'storeDealerCode') {
        input.style.background = '';
      }
    });
    
    // 恢复下拉框
    var selects = modal.querySelectorAll('select');
    selects.forEach(function(select) {
      select.disabled = false;
      select.style.background = '';
      select.style.cursor = '';
    });
    
    // 恢复车系选择器
    var storeSeriesSelector = document.getElementById('storeSeriesSelector');
    if (storeSeriesSelector) {
      storeSeriesSelector.style.cursor = 'pointer';
      storeSeriesSelector.style.borderColor = '';
      storeSeriesSelector.style.background = '';
      storeSeriesSelector.onclick = function() { toggleStoreSeriesDropdown(); };
      // 恢复下拉箭头
      var arrow = storeSeriesSelector.querySelector('span:last-child');
      if (arrow) arrow.style.display = '';
    }
    
    // 恢复车系标签的删除功能
    var storeSelectedSeries = document.getElementById('storeSelectedSeries');
    if (storeSelectedSeries) {
      var tags = storeSelectedSeries.querySelectorAll('span[data-original-onclick]');
      tags.forEach(function(tag) {
        var originalOnclick = tag.getAttribute('data-original-onclick');
        tag.setAttribute('onclick', originalOnclick);
        tag.removeAttribute('data-original-onclick');
      });
      // 恢复所有×按钮显示
      var closeBtns = storeSelectedSeries.querySelectorAll('span[style*="display: none"]');
      closeBtns.forEach(function(btn) {
        btn.style.display = '';
      });
    }
    
    // 恢复表单提示
    var formHints = modal.querySelectorAll('.form-hint');
    formHints.forEach(function(hint) {
      hint.style.display = '';
    });
    
    // 恢复地图选址按钮
    var mapBtn = modal.querySelector('button[onclick="openMapPicker()"]');
    if (mapBtn) {
      mapBtn.style.display = '';
    }
    
    // 恢复底部按钮
    var footer = modal.querySelector('.modal-footer');
    if (footer) {
      footer.innerHTML = '<button class="btn btn-secondary" onclick="closeModal(\'storeModal\')">取消</button><button class="btn btn-primary" onclick="saveStoreData()">确认保存</button>';
    }
  }

  // ==================== 门店列表全选功能 ====================
  // 全选/取消全选
  function toggleSelectAllStoreRows() {
    var headerCheckbox = document.getElementById('selectAllStoreRows');
    var rowCheckboxes = document.querySelectorAll('.store-row-checkbox');
    var isChecked = headerCheckbox.checked;

    rowCheckboxes.forEach(function(cb) {
      cb.checked = isChecked;
    });

    updateStoreSelectionInfo();
  }

  // 更新已选数量显示
  function updateStoreSelectionInfo() {
    var rowCheckboxes = document.querySelectorAll('.store-row-checkbox');
    var checkedCount = document.querySelectorAll('.store-row-checkbox:checked').length;
    var totalRows = rowCheckboxes.length;
    var infoEl = document.getElementById('storeSelectionInfo');

    // 更新显示文本
    infoEl.textContent = '已选 ' + checkedCount + ' / ' + totalRows + ' 条，共 256 条数据';

    // 更新全选框状态
    var headerCheckbox = document.getElementById('selectAllStoreRows');
    if (checkedCount === 0) {
      headerCheckbox.checked = false;
      headerCheckbox.indeterminate = false;
    } else if (checkedCount === totalRows) {
      headerCheckbox.checked = true;
      headerCheckbox.indeterminate = false;
    } else {
      headerCheckbox.checked = false;
      headerCheckbox.indeterminate = true;
    }
  }

  // 批量启用/停用
  function batchToggleStoreStatus(action) {
    var checkedBoxes = document.querySelectorAll('.store-row-checkbox:checked');
    if (checkedBoxes.length === 0) {
      showToast('请先选择至少一条数据', 'warning');
      return;
    }

    var actionText = action === 'enable' ? '启用' : '停用';

    if (action === 'disable') {
      // 停用前显示警告
      showConfirmDialog('门店停用后，该门店停止接收新线索分配。已分配到该门店的进行中线索保持现状，不做强制流转。是否确认？', function() {
        executeBatchToggleStoreStatus(action);
      });
    } else {
      executeBatchToggleStoreStatus(action);
    }
  }

  function executeBatchToggleStoreStatus(action) {
    var checkedBoxes = document.querySelectorAll('.store-row-checkbox:checked');
    var actionText = action === 'enable' ? '启用' : '停用';
    var successCount = 0;

    checkedBoxes.forEach(function(cb) {
      var row = cb.closest('tr');
      var badge = row.querySelector('.status-badge.status-active, .status-badge.status-inactive');
      var btn = row.querySelector('button[onclick*="toggleStatus"]');

      if (action === 'enable') {
        if (badge && !badge.classList.contains('status-active')) {
          badge.className = 'status-badge status-active';
          badge.innerHTML = '启用';
          if (btn) { btn.textContent = '停用'; }
          successCount++;
        }
      } else {
        if (badge && badge.classList.contains('status-active')) {
          badge.className = 'status-badge status-inactive';
          badge.innerHTML = '停用';
          if (btn) { btn.textContent = '启用'; }
          successCount++;
        }
      }
    });

    if (successCount > 0) {
      showToast('已' + actionText + ' ' + successCount + ' 条数据', 'success');
      document.getElementById('selectAllStoreRows').checked = false;
      document.getElementById('selectAllStoreRows').indeterminate = false;
      document.querySelectorAll('.store-row-checkbox').forEach(function(cb) { cb.checked = false; });
      updateStoreSelectionInfo();
    } else {
      showToast('所选数据已处于' + actionText + '状态，无需操作', 'info');
    }
  }

  // Toggle Submenu
  function toggleSubmenu(item) {
    item.classList.toggle('open');
    const submenu = item.nextElementSibling;
    if (submenu && submenu.classList.contains('sidebar-submenu')) {
      submenu.classList.toggle('open');
    }
  }

  // Modal
  function openModal(id) {
    document.getElementById(id).classList.add('active');
    // 车系管理弹窗初始化
    if (id === 'vehicleModal') {
      resetVehicleModalStores();
    }
  }
  function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    // 清除编辑状态（双向联动）
    if (id === 'vehicleModal') {
      currentEditingSeriesId = null;
    }
    if (id === 'storeModal') {
      currentEditingStoreId = null;
    }
  }

  // Account management modal
  var dkAccountModalMode = 'add';
  var selectedDkAccountId = '';
  var dkAccountOptions = [
    {id:'U10021', name:'张敏 · 黑名单审核', shortName:'张敏', group:'总部线索运营部', type:'总部', sort:1, status:'1'},
    {id:'U10008', name:'李强 · DCC主管', shortName:'李强', group:'总部DCC管理组', type:'总部', sort:2, status:'1'},
    {id:'U10032', name:'陈晨 · 线索运营', shortName:'陈晨', group:'经销商线索运营部', type:'经销商', sort:3, status:'1'},
    {id:'U10016', name:'王磊 · 运营负责人', shortName:'王磊', group:'经销商运营管理部', type:'经销商', sort:4, status:'1'},
    {id:'admin1', name:'某供应商A', shortName:'供应A', group:'帐号管理', type:'供应商', sort:5, status:'1'},
    {id:'admin2', name:'某供应商B', shortName:'供应B', group:'帐号管理', type:'供应商', sort:6, status:'1'}
  ];

  function syncDkAccountPickerValue() {
    var idInput = document.getElementById('dkAccountIdInput');
    var countEl = document.getElementById('dkAccountPickerCount');
    if (idInput) idInput.value = selectedDkAccountId || '';
    if (countEl) countEl.textContent = '已选 ' + (selectedDkAccountId ? 1 : 0) + ' / ' + dkAccountOptions.length;
  }

  function renderDkAccountPickerList() {
    var listEl = document.getElementById('dkAccountPickerList');
    var searchEl = document.getElementById('dkAccountPickerSearch');
    if (!listEl) return;
    var keyword = searchEl ? searchEl.value.toLowerCase().trim() : '';
    var rows = dkAccountOptions.filter(function(item) {
      var haystack = [item.id, item.name, item.shortName, item.group].join(' ').toLowerCase();
      return !keyword || haystack.indexOf(keyword) > -1;
    });
    if (!rows.length) {
      listEl.innerHTML = '<div style="padding: 18px 12px; text-align: center; color: var(--gray-400); font-size: 13px;">未找到匹配帐号</div>';
      syncDkAccountPickerValue();
      return;
    }
    listEl.innerHTML = rows.map(function(item) {
      var checked = item.id === selectedDkAccountId;
      return '<label style="display: flex; align-items: flex-start; gap: 10px; padding: 11px 12px; border-bottom: 1px solid var(--gray-100); cursor: pointer; background: ' + (checked ? 'var(--primary-light)' : '#fff') + ';">' +
        '<input type="radio" name="dkAccountPickerRadio" value="' + escapeHTML(item.id) + '"' + (checked ? ' checked' : '') + ' onchange="selectDkAccountPickerItem(\'' + escapeJS(item.id) + '\')" style="margin-top: 3px; accent-color: var(--primary);">' +
        '<span style="display: block;">' +
          '<span style="display: block; font-weight: 700; color: var(--gray-900); font-size: 14px;">' + escapeHTML(item.name) + '</span>' +
          '<span style="display: block; margin-top: 3px; color: var(--gray-500); font-size: 13px;">' + escapeHTML(item.id + '｜' + item.group) + '</span>' +
        '</span>' +
      '</label>';
    }).join('');
    syncDkAccountPickerValue();
  }

  function findDkAccountOption(id) {
    return dkAccountOptions.find(function(item) { return item.id === id; });
  }

  function fillDkAccountFormByData(data) {
    var typeInput = document.getElementById('dkAccountTypeInput');
    var nameInput = document.getElementById('dkAccountNameInput');
    var shortNameInput = document.getElementById('dkAccountShortNameInput');
    var sortInput = document.getElementById('dkAccountSortInput');
    var statusInput = document.getElementById('dkAccountStatusInput');
    if (!data) {
      typeInput.value = '供应商';
      nameInput.value = '';
      shortNameInput.value = '';
      sortInput.value = '';
      statusInput.value = '1';
      return;
    }
    typeInput.value = normalizeDkAccountType(data.type);
    nameInput.value = data.name || '';
    shortNameInput.value = data.shortName || '';
    sortInput.value = data.sort !== undefined ? data.sort : '';
    statusInput.value = data.status !== undefined ? String(data.status) : '1';
  }

  function normalizeDkAccountType(type) {
    if (type === '1' || type === '1-总部' || type === '总部' || type === '内部') return '总部';
    if (type === '2' || type === '2-经销商' || type === '经销商') return '经销商';
    if (type === '3' || type === '3-供应商' || type === '供应商') return '供应商';
    return type || '供应商';
  }

  function selectDkAccountPickerItem(id) {
    selectedDkAccountId = id || '';
    renderDkAccountPickerList();
  }

  function clearDkAccountPickerSelection() {
    selectedDkAccountId = '';
    renderDkAccountPickerList();
  }

  function openDkAccountModal(mode, data) {
    var modal = document.getElementById('dkAccountModal');
    var title = document.getElementById('dkAccountModalTitle');
    var searchInput = document.getElementById('dkAccountPickerSearch');
    var confirmBtn = document.getElementById('dkAccountConfirmBtn');
    dkAccountModalMode = mode;
    selectedDkAccountId = data && data.id ? data.id : '';
    if (searchInput) searchInput.value = '';

    if (mode === 'add') {
      title.textContent = '新增帐号';
      fillDkAccountFormByData(null);
      confirmBtn.textContent = '确认创建';
    } else if (mode === 'edit' && data) {
      title.textContent = '编辑帐号';
      fillDkAccountFormByData(data);
      confirmBtn.textContent = '确认保存';
    }
    renderDkAccountPickerList();
    modal.classList.add('active');
  }

  function saveDkAccount() {
    var id = document.getElementById('dkAccountIdInput').value.trim();
    var name = document.getElementById('dkAccountNameInput').value.trim();
    var shortName = document.getElementById('dkAccountShortNameInput').value.trim();
    if (!id || !name || !shortName) {
      showToast('请填写帐号 ID、帐号全称和帐号简称', 'error');
      return;
    }
    closeModal('dkAccountModal');
    showToast(dkAccountModalMode === 'add' ? '帐号创建成功' : '帐号保存成功', 'success');
  }

  // Brand Modal
  function openBrandModal(mode, data) {
    var modal = document.getElementById('brandModal');
    var title = document.getElementById('brandModalTitle');
    var nameInput = document.getElementById('brandNameInput');
    var codeInput = document.getElementById('brandCodeInput');
    var logoInput = document.getElementById('brandLogoInput');
    var sortInput = document.getElementById('brandSortInput');
    var statusSelect = document.getElementById('brandStatus');
    var confirmBtn = document.getElementById('brandConfirmBtn');

    if (mode === 'add') {
      title.textContent = '新增品牌';
      nameInput.value = '';
      codeInput.value = '';
      codeInput.readOnly = false;
      codeInput.style.background = '';
      logoInput.value = '';
      sortInput.value = '';
      statusSelect.value = '1';
      confirmBtn.textContent = '确认创建';
      confirmBtn.setAttribute('onclick', "closeModal('brandModal'); showToast('品牌创建成功', 'success')");
    } else if (mode === 'edit' && data) {
      title.textContent = '编辑品牌';
      nameInput.value = data.name || '';
      codeInput.value = data.code || '';
      codeInput.readOnly = true;
      codeInput.style.background = 'var(--gray-100)';
      logoInput.value = '';
      sortInput.value = data.sort !== undefined ? data.sort : '';
      statusSelect.value = data.status !== undefined ? String(data.status) : '1';
      confirmBtn.textContent = '确认保存';
      confirmBtn.setAttribute('onclick', "closeModal('brandModal'); showToast('品牌保存成功', 'success')");
    }
    modal.classList.add('active');
  }

  // Vehicle Modal
  function openVehicleModal(mode, data) {
    var modal = document.getElementById('vehicleModal');
    var title = document.getElementById('vehicleModalTitle');
    var nameInput = document.getElementById('seriesNameInput');
    var codeInput = document.getElementById('seriesCodeInput');
    var brandSelect = document.getElementById('vehicleBrandSelect');
    var energySelect = document.getElementById('seriesEnergyType');
    var priceMin = document.getElementById('seriesPriceMin');
    var priceMax = document.getElementById('seriesPriceMax');
    var sortInput = document.getElementById('seriesSortInput');
    var descInput = document.getElementById('seriesDescInput');
    var remarkInput = document.getElementById('seriesRemarkInput');
    var statusSelect = document.getElementById('seriesStatus');
    var confirmBtn = document.getElementById('vehicleConfirmBtn');

    if (mode === 'add') {
      title.textContent = '新增车系';
      nameInput.value = '';
      codeInput.value = '';
      codeInput.readOnly = false;
      codeInput.style.background = '';
      brandSelect.value = '';
      energySelect.value = '';
      priceMin.value = '';
      priceMax.value = '';
      sortInput.value = '';
      descInput.value = '';
      remarkInput.value = '';
      statusSelect.value = '1';
      confirmBtn.textContent = '确认创建';
      confirmBtn.setAttribute('onclick', "closeModal('vehicleModal'); showToast('车系创建成功', 'success')");
      currentEditingSeriesId = null;
    } else if (mode === 'edit' && data) {
      title.textContent = '编辑车系';
      nameInput.value = data.name || '';
      codeInput.value = data.code || '';
      codeInput.readOnly = true;
      codeInput.style.background = 'var(--gray-100)';
      brandSelect.value = data.brand || '';
      energySelect.value = data.energyType || '';
      priceMin.value = '';
      priceMax.value = '';
      sortInput.value = data.sort !== undefined ? data.sort : '';
      descInput.value = '';
      remarkInput.value = '';
      statusSelect.value = data.status !== undefined ? String(data.status) : '1';
      confirmBtn.textContent = '确认保存';
      confirmBtn.setAttribute('onclick', "closeModal('vehicleModal'); showToast('车系保存成功', 'success')");
      currentEditingSeriesId = data.id || null;
    }
    modal.classList.add('active');
    if (mode === 'add' || (mode === 'edit' && data && data.brand)) {
      resetVehicleModalStores();
      onVehicleBrandChange();
      if (mode === 'edit' && data && data.id) {
        vehicleSelectedStoreIds = getVehicleModalStoreIdsForSeries(data.id, data.brand);
        renderVehicleStoreList();
        updateVehicleSelectedStoresDisplay();
      }
    }
  }

  // Header notice popover
  function toggleHeaderPopover(id) {
    document.querySelectorAll('.header-popover').forEach(function(popover) {
      if (popover.id !== id) popover.classList.remove('show');
    });
    var popover = document.getElementById(id);
    if (popover) popover.classList.toggle('show');
  }

  document.addEventListener('click', function(event) {
    if (!event.target.closest('.header-action-wrap')) {
      document.querySelectorAll('.header-popover').forEach(function(popover) {
        popover.classList.remove('show');
      });
    }
  });

  // Toast
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.innerHTML = (icons[type] || icons.info) + ' ' + message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ========== Async Export System ==========
  var _asyncExport = {
    isRunning: false,
    isCancelled: false,
    timeoutId: null,
    currentTask: null
  };

  function openAsyncExportModal(title, description) {
    var modal = document.getElementById('asyncExportModal');
    var content = document.getElementById('asyncExportContent');
    var footer = document.getElementById('asyncExportFooter');
    var titleEl = document.getElementById('asyncExportTitle');
    var descEl = document.getElementById('asyncExportDesc');
    var progressBar = document.getElementById('asyncExportProgressBar');
    var statusEl = document.getElementById('asyncExportStatus');
    var detailEl = document.getElementById('asyncExportDetail');
    var cancelBtn = document.getElementById('asyncExportCancelBtn');

    // Reset state
    content.className = 'async-export-content';
    titleEl.textContent = title || '正在准备导出...';
    descEl.textContent = description || '系统正在处理您的导出请求';
    progressBar.style.width = '0%';
    statusEl.textContent = '准备中...';
    detailEl.textContent = '';
    footer.style.display = 'flex';
    cancelBtn.style.display = '';
    cancelBtn.textContent = '取消导出';
    cancelBtn.className = 'btn btn-secondary';

    modal.classList.add('active');
  }

  function updateAsyncExportProgress(percent, status, detail) {
    var progressBar = document.getElementById('asyncExportProgressBar');
    var statusEl = document.getElementById('asyncExportStatus');
    var detailEl = document.getElementById('asyncExportDetail');

    if (progressBar) progressBar.style.width = percent + '%';
    if (statusEl) statusEl.textContent = status || '';
    if (detailEl) detailEl.textContent = detail || '';
  }

  function showAsyncExportSuccess(fileName) {
    var content = document.getElementById('asyncExportContent');
    var titleEl = document.getElementById('asyncExportTitle');
    var descEl = document.getElementById('asyncExportDesc');
    var progressBar = document.getElementById('asyncExportProgressBar');
    var statusEl = document.getElementById('asyncExportStatus');
    var detailEl = document.getElementById('asyncExportDetail');
    var footer = document.getElementById('asyncExportFooter');
    var cancelBtn = document.getElementById('asyncExportCancelBtn');

    content.className = 'async-export-content async-export-success';
    titleEl.textContent = '✅ 导出成功！';
    descEl.textContent = fileName ? '文件已准备就绪，正在下载...' : '数据导出完成';
    progressBar.style.width = '100%';
    progressBar.style.background = 'var(--success)';
    statusEl.textContent = '导出完成';
    detailEl.textContent = '';
    footer.style.display = 'flex';
    cancelBtn.textContent = '关闭';
    cancelBtn.className = 'btn btn-primary';
    cancelBtn.onclick = closeAsyncExportModal;

    // Auto close after 2 seconds
    setTimeout(function() {
      if (document.getElementById('asyncExportModal').classList.contains('active')) {
        closeAsyncExportModal();
      }
    }, 2000);
  }

  function showAsyncExportFailed(error) {
    var content = document.getElementById('asyncExportContent');
    var titleEl = document.getElementById('asyncExportTitle');
    var descEl = document.getElementById('asyncExportDesc');
    var progressBar = document.getElementById('asyncExportProgressBar');
    var statusEl = document.getElementById('asyncExportStatus');
    var footer = document.getElementById('asyncExportFooter');
    var cancelBtn = document.getElementById('asyncExportCancelBtn');

    content.className = 'async-export-content async-export-failed';
    titleEl.textContent = '❌ 导出失败';
    descEl.textContent = error || '导出过程中出现错误，请重试';
    progressBar.style.background = 'var(--danger)';
    statusEl.textContent = '';
    footer.style.display = 'flex';
    cancelBtn.textContent = '关闭';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.onclick = closeAsyncExportModal;
  }

  function closeAsyncExportModal() {
    document.getElementById('asyncExportModal').classList.remove('active');
    _asyncExport.isRunning = false;
    _asyncExport.isCancelled = true;
    if (_asyncExport.timeoutId) {
      clearTimeout(_asyncExport.timeoutId);
      _asyncExport.timeoutId = null;
    }
  }

  function cancelAsyncExport() {
    if (_asyncExport.isRunning) {
      _asyncExport.isCancelled = true;
      if (_asyncExport.timeoutId) {
        clearTimeout(_asyncExport.timeoutId);
        _asyncExport.timeoutId = null;
      }
      closeAsyncExportModal();
      showToast('已取消导出', 'warning');
    }
  }

  function doAsyncExport(options) {
    var title = options.title || '正在导出数据...';
    var description = options.description || '';
    var dataPrepareFn = options.dataPrepare;
    var downloadFn = options.download;
    var onStart = options.onStart;
    var steps = options.steps || [
      { percent: 20, status: '正在收集数据...', delay: 300 },
      { percent: 50, status: '正在处理数据...', delay: 400 },
      { percent: 80, status: '正在生成文件...', delay: 300 },
      { percent: 95, status: '即将完成...', delay: 200 }
    ];

    _asyncExport.isCancelled = false;
    _asyncExport.isRunning = true;

    openAsyncExportModal(title, description);
    if (onStart) onStart();

    var stepIndex = 0;

    function runNextStep() {
      if (_asyncExport.isCancelled) return;

      if (stepIndex < steps.length) {
        var step = steps[stepIndex];
        updateAsyncExportProgress(step.percent, step.status, '');
        _asyncExport.timeoutId = setTimeout(function() {
          stepIndex++;
          runNextStep();
        }, step.delay);
      } else {
        // Complete
        try {
          if (dataPrepareFn) dataPrepareFn();
          updateAsyncExportProgress(95, '正在生成文件...', '');
          _asyncExport.timeoutId = setTimeout(function() {
            if (!_asyncExport.isCancelled) {
              if (downloadFn) downloadFn();
              var fileName = options.fileName || '导出数据';
              showAsyncExportSuccess(fileName);
              if (options.onSuccess) options.onSuccess();
            }
          }, 200);
        } catch (err) {
          showAsyncExportFailed(err.message || '导出失败');
          if (options.onError) options.onError(err);
        }
      }
    }

    _asyncExport.timeoutId = setTimeout(runNextStep, 300);
  }

  // ========== Confirm Dialog ==========
  var _confirmCallback = null;

  function showConfirmDialog(msg, callback) {
    document.getElementById('confirmDialogMsg').textContent = msg;
    _confirmCallback = callback;
    document.getElementById('confirmDialogOverlay').classList.add('active');
  }

  function executeConfirmDialog() {
    document.getElementById('confirmDialogOverlay').classList.remove('active');
    if (_confirmCallback) {
      _confirmCallback();
      _confirmCallback = null;
    }
  }

  function closeConfirmDialog() {
    document.getElementById('confirmDialogOverlay').classList.remove('active');
    _confirmCallback = null;
  }

  // ========== Import/Export Functions ==========
  
  var importCurrentStep = 1;
  var importData = [];
  
  function closeImportSeriesModal() {
    closeModal('importSeriesModal');
    setTimeout(resetImportSeriesModal, 300);
  }
  
  function resetImportSeriesModal() {
    importCurrentStep = 1;
    importData = [];
    
    // Reset step indicators
    document.getElementById('importStep1').className = 'import-step active';
    document.getElementById('importStep2').className = 'import-step';
    document.getElementById('importStep3').className = 'import-step';
    document.getElementById('importLine1').style.background = 'var(--gray-200)';
    document.getElementById('importLine2').style.background = 'var(--gray-200)';
    
    // Reset content visibility
    document.getElementById('importStepContent1').style.display = 'block';
    document.getElementById('importStepContent2').style.display = 'none';
    document.getElementById('importStepContent3').style.display = 'none';
    
    // Reset buttons
    document.getElementById('importNextBtn').textContent = '下一步';
    document.getElementById('importNextBtn').disabled = true;
    document.getElementById('importModalFooter').style.display = 'flex';
    
    // Reset file selection
    resetImportFile();
  }
  
  function resetImportFile() {
    document.getElementById('seriesImportFile').value = '';
    document.getElementById('selectedFileInfo').style.display = 'none';
    document.getElementById('importNextBtn').disabled = true;
  }
  
  function handleSeriesImportFile(input) {
    if (input.files && input.files[0]) {
      var file = input.files[0];
      var fileName = file.name;
      var fileSize = '';
      
      if (file.size > 1024 * 1024) {
        fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      } else if (file.size > 1024) {
        fileSize = (file.size / 1024).toFixed(2) + ' KB';
      } else {
        fileSize = file.size + ' B';
      }
      
      document.getElementById('selectedFileName').textContent = fileName;
      document.getElementById('selectedFileSize').textContent = '文件大小: ' + fileSize;
      document.getElementById('selectedFileInfo').style.display = 'block';
      document.getElementById('importNextBtn').disabled = false;
      
      // Simulate parsing - in real scenario would use a library like SheetJS
      simulateImportData();
    }
  }
  
  function simulateImportData() {
    // Simulated import data for demo
    importData = [
      { row: 1, name: '理想L7', brand: '理想汽车', energy: '增程(EREV)', price: '31.98~37.98', status: '启用', error: null },
      { row: 2, name: '理想L6', brand: '理想汽车', energy: '增程(EREV)', price: '24.98~27.98', status: '启用', error: null },
      { row: 3, name: '问界M7', brand: '问界', energy: '增程(EREV)', price: '24.98~32.98', status: '启用', error: null },
      { row: 4, name: '问界M5', brand: '问界', energy: '纯电(BEV)', price: '24.98~27.98', status: '启用', error: null },
      { row: 5, name: '小鹏P7+', brand: '小鹏汽车', energy: '纯电(BEV)', price: '18.98~22.98', status: '启用', error: null },
    ];
  }
  
  function downloadSeriesTemplate() {
    // Create CSV template content
    var csvContent = '\uFEFF'; // BOM for UTF-8
    csvContent += '\u6C49\u5B57\u8BCD\u7C7B\u540D\u79F0,\u6240\u5C5E\u54C1\u724C,\u80FD\u6E90\u7C7B\u578B,\u6307\u5BFC\u4EF7\u6700\u4F4E(\u4E07),\u6307\u5BFC\u4EF7\u6700\u9AD8(\u4E07),\u6392\u5E8F\u503C,\u72B6\u6001\n';
    csvContent += '\u7406\u60F3L7,\u7406\u60F3\u6C7D\u8F66,\u589E\u7A0B(EREV),31.98,37.98,1,\u542F\u7528\n';
    csvContent += '\u7406\u60F3L6,\u7406\u60F3\u6C7D\u8F66,\u589E\u7A0B(EREV),24.98,27.98,2,\u542F\u7528\n';
    csvContent += '\u95EE\u754CM7,\u95EE\u754C,\u589E\u7A0B(EREV),24.98,32.98,1,\u542F\u7528\n';
    
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    var url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '\u8F66\u7CFB\u5BFC\u5165\u6A21\u677F.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('\u6A21\u677F\u4E0B\u8F7D\u6210\u529F', 'success');
  }
  
  function goImportNextStep() {
    if (importCurrentStep === 1) {
      // Go to step 2: Preview
      importCurrentStep = 2;
      updateImportStepUI();
      renderImportPreview();
    } else if (importCurrentStep === 2) {
      // Go to step 3: Complete
      importCurrentStep = 3;
      updateImportStepUI();
      document.getElementById('importCompleteInfo').textContent = '成功导入 ' + importData.length + ' 条车系列表数据';
    }
  }
  
  function updateImportStepUI() {
    var step1 = document.getElementById('importStep1');
    var step2 = document.getElementById('importStep2');
    var step3 = document.getElementById('importStep3');
    var line1 = document.getElementById('importLine1');
    var line2 = document.getElementById('importLine2');
    
    if (importCurrentStep === 1) {
      step1.className = 'import-step active';
      step2.className = 'import-step';
      step3.className = 'import-step';
    } else if (importCurrentStep === 2) {
      step1.className = 'import-step completed';
      step1.querySelector('.step-num').textContent = '\u2713';
      step2.className = 'import-step active';
      line1.style.background = 'var(--success)';
      
      document.getElementById('importStepContent1').style.display = 'none';
      document.getElementById('importStepContent2').style.display = 'block';
      document.getElementById('importNextBtn').textContent = '确认导入';
      document.getElementById('importNextBtn').disabled = false;
    } else if (importCurrentStep === 3) {
      step1.className = 'import-step completed';
      step1.querySelector('.step-num').textContent = '\u2713';
      step2.className = 'import-step completed';
      step2.querySelector('.step-num').textContent = '\u2713';
      step3.className = 'import-step active';
      line1.style.background = 'var(--success)';
      line2.style.background = 'var(--success)';
      
      document.getElementById('importStepContent2').style.display = 'none';
      document.getElementById('importStepContent3').style.display = 'block';
      document.getElementById('importModalFooter').style.display = 'none';
      
      showToast('\u5BFC\u5165\u6210\u529F', 'success');
    }
  }
  
  function renderImportPreview() {
    var tbody = document.getElementById('importPreviewBody');
    tbody.innerHTML = '';
    
    document.getElementById('importDataCount').textContent = importData.length;
    
    importData.forEach(function(item) {
      var tr = document.createElement('tr');
      tr.style.background = item.error ? 'var(--danger-light)' : '';
      tr.innerHTML = '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + item.row + '</td>' +
        '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + item.name + '</td>' +
        '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + item.brand + '</td>' +
        '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);"><span class="status-badge status-inactive">' + item.energy + '</span></td>' +
        '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + item.price + '</td>' +
        '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);"><span class="status-badge status-active">' + item.status + '</span></td>' +
        '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100); color: ' + (item.error ? 'var(--danger)' : 'var(--success)') + ';">' + (item.error || '\u2713 \u6839\u636E\u6B63\u5E38') + '</td>';
      tbody.appendChild(tr);
    });
  }
  
  function exportSeriesData() {
    var now = new Date();
    var dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    var fileName = '车系管理_' + dateStr + '.csv';

    doAsyncExport({
      title: '正在导出血系数据...',
      description: '正在整理车系信息',
      fileName: fileName,
      steps: [
        { percent: 20, status: '正在收集车系数据...', delay: 400 },
        { percent: 50, status: '正在整理车系信息...', delay: 500 },
        { percent: 80, status: '正在处理导出格式...', delay: 400 },
        { percent: 95, status: '即将完成...', delay: 200 }
      ],
      download: function() {
        var rows = document.querySelectorAll('#page-vehicle tbody tr');
        var csvContent = '\uFEFF'; // BOM for UTF-8

        // Header
        csvContent += 'ID,\u8F66\u7CFB\u540D\u79F0,\u6240\u5C5E\u54C1\u724C,\u80FD\u6E90\u7C7B\u578B,\u6307\u5BFC\u4EF7\u533A\u95F4(\u4E07),\u6392\u5E8F\u503C,\u5173\u8054\u95E8\u5E97,\u72B6\u6001\n';

        rows.forEach(function(row) {
          var cells = row.querySelectorAll('td');
          if (cells.length >= 9) {
            var id = cells[0].textContent.trim();
            var name = cells[2].querySelector('strong').textContent.trim();
            var brand = cells[3].textContent.trim();
            var energy = cells[4].textContent.trim();
            var price = cells[5].textContent.trim();
            var sort = cells[6].textContent.trim();
            var stores = cells[7].textContent.trim();
            var status = cells[8].querySelector('.status-badge').textContent.trim();

            csvContent += id + ',' + name + ',' + brand + ',' + energy + ',' + price + ',' + sort + ',' + stores + ',' + status + '\n';
          }
        });

        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('\u6570\u636E\u5BFC\u51FA\u6210\u529F', 'success');
      }
    });
  }

  // Filter by status tab
  function filterByStatus(btn, status) {
    document.querySelectorAll('#page-leads .tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    var tbody = document.getElementById('clue-tbody');
    if (!tbody) return;

    var rows = tbody.querySelectorAll('tr');
    var visibleCount = 0;
    var statusTextMap = {'':'全部','1':'待处理','2':'处理中','3':'已下发','4':'下发失败','5':'仅接收'};

    rows.forEach(function(row) {
      var statusCell = row.querySelector('td:nth-child(8)');
      if (!statusCell) { row.style.display = ''; visibleCount++; return; }
      var statusBadge = statusCell.querySelector('.status-badge');
      var cellText = statusBadge ? statusBadge.textContent.trim() : statusCell.textContent.trim().replace('● ', '');
      var match = !status || cellText === statusTextMap[status];
      row.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    var infoEl = document.querySelector('#page-leads .pagination-info');
    if (infoEl) infoEl.textContent = '共 ' + visibleCount + ' 条数据';

    if (status) {
      showToast('已筛选：' + statusTextMap[status], 'info');
    } else {
      showToast('显示全部线索', 'info');
    }
  }

  