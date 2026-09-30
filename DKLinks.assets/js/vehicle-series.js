// ==================== 车系关联专营店选择 ====================

  // 打开车系编辑弹窗（设置 currentEditingSeriesId 用于双向联动）
  function openVehicleEditModal(seriesId) {
    currentEditingSeriesId = String(seriesId) || null;
    // TODO: 这里应该填充车系的现有数据到表单
    // 目前演示中"编辑"按钮只是打开空弹窗，所以只设置ID即可
    openModal('vehicleModal');
  }

  // 门店完整数据（按品牌分组，包含省市区信息）
  var vehicleStoreData = {
    '理想汽车': [
      { id: 'LX001', name: '深圳理想南山店', province: '广东省', city: '深圳市', district: '南山区' },
      { id: 'LX002', name: '深圳理想福田店', province: '广东省', city: '深圳市', district: '福田区' },
      { id: 'LX003', name: '广州理想天河店', province: '广东省', city: '广州市', district: '天河区' },
      { id: 'LX004', name: '广州理想白云店', province: '广东省', city: '广州市', district: '白云区' },
      { id: 'LX005', name: '北京理想朝阳店', province: '北京市', city: '北京市', district: '朝阳区' },
      { id: 'LX006', name: '北京理想海淀店', province: '北京市', city: '北京市', district: '海淀区' },
      { id: 'LX007', name: '上海理想浦东店', province: '上海市', city: '上海市', district: '浦东新区' },
      { id: 'LX008', name: '上海理想静安店', province: '上海市', city: '上海市', district: '静安区' },
      { id: 'LX009', name: '杭州理想西湖店', province: '浙江省', city: '杭州市', district: '西湖区' },
      { id: 'LX010', name: '成都理想锦江店', province: '四川省', city: '成都市', district: '锦江区' }
    ],
    '问界': [
      { id: 'WJ001', name: '深圳问界福田店', province: '广东省', city: '深圳市', district: '福田区' },
      { id: 'WJ002', name: '深圳问界南山店', province: '广东省', city: '深圳市', district: '南山区' },
      { id: 'WJ003', name: '广州问界天河店', province: '广东省', city: '广州市', district: '天河区' },
      { id: 'WJ004', name: '北京问界朝阳店', province: '北京市', city: '北京市', district: '朝阳区' },
      { id: 'WJ005', name: '成都问界武侯店', province: '四川省', city: '成都市', district: '武侯区' }
    ],
    '小鹏汽车': [
      { id: 'XP001', name: '广州小鹏天河店', province: '广东省', city: '广州市', district: '天河区' },
      { id: 'XP002', name: '广州小鹏番禺店', province: '广东省', city: '广州市', district: '番禺区' },
      { id: 'XP003', name: '深圳小鹏南山店', province: '广东省', city: '深圳市', district: '南山区' },
      { id: 'XP004', name: '深圳小鹏龙华店', province: '广东省', city: '深圳市', district: '龙华区' },
      { id: 'XP005', name: '北京小鹏海淀店', province: '北京市', city: '北京市', district: '海淀区' }
    ],
    '东风日产': [
      { id: 'DFN_GZ_PY_001', name: '东风日产·广州番禺店', province: '广东省', city: '广州市', district: '番禺区' },
      { id: 'DFN_SZ_NS_002', name: '东风日产·深圳南山店', province: '广东省', city: '深圳市', district: '南山区' },
      { id: 'DFN_SH_PD_003', name: '东风日产·上海浦东店', province: '上海市', city: '上海市', district: '浦东新区' },
      { id: 'DFN_GZ_TH_004', name: '东风日产·广州天河店', province: '广东省', city: '广州市', district: '天河区' }
    ]
  };

  // 已选门店ID列表
  var vehicleSelectedStoreIds = [];

  var vehicleStoreToDealerIdMap = {
    LX001: 'd1',
    LX002: 'd2',
    LX003: 'd3',
    LX004: 'd4',
    LX007: 'd5',
    WJ001: 'd6',
    WJ002: 'd7',
    WJ003: 'd8',
    XP003: 'd9',
    XP001: 'd10',
    DFN_GZ_PY_001: 'd11',
    DFN_SZ_NS_002: 'd12',
    DFN_SH_PD_003: 'd13'
  };

  var dealerIdToVehicleStoreMap = {};
  Object.keys(vehicleStoreToDealerIdMap).forEach(function(storeId) {
    dealerIdToVehicleStoreMap[vehicleStoreToDealerIdMap[storeId]] = storeId;
  });

  function toDealerRelationIdFromVehicleStore(storeId) {
    return vehicleStoreToDealerIdMap[storeId] || storeId;
  }

  function toVehicleStoreIdFromDealerRelation(dealerId, brandStores) {
    if (brandStores.some(function(store) { return store.id === dealerId; })) return dealerId;
    var mappedId = dealerIdToVehicleStoreMap[dealerId];
    if (mappedId && brandStores.some(function(store) { return store.id === mappedId; })) return mappedId;
    var dealer = dealerData[dealerId];
    if (dealer) {
      var matched = brandStores.find(function(store) { return store.id === dealer.code; });
      if (matched) return matched.id;
    }
    return '';
  }

  // 初始化车系关联专营店选择器
  function initVehicleStoreSelector() {
    var provinceSelect = document.getElementById('vehicleStoreProvince');
    var citySelect = document.getElementById('vehicleStoreCity');

    if (!provinceSelect) return;

    // 重置选择器
    provinceSelect.innerHTML = '<option value="">选择省份</option>';
    citySelect.innerHTML = '<option value="">选择城市</option>';
    document.getElementById('vehicleStoreSearch').value = '';

    // 填充省份选项
    var provinces = Object.keys(cityTreeData).sort();
    provinces.forEach(function(province) {
      var option = document.createElement('option');
      option.value = province;
      option.textContent = province;
      provinceSelect.appendChild(option);
    });

    // 渲染门店列表
    renderVehicleStoreList();
    updateVehicleSelectedStoresDisplay();
  }

  // 品牌变更时更新门店列表
  function onVehicleBrandChange() {
    var brand = document.getElementById('vehicleBrandSelect').value;
    var provinceSelect = document.getElementById('vehicleStoreProvince');
    var citySelect = document.getElementById('vehicleStoreCity');

    // 重置选择器和搜索框
    provinceSelect.innerHTML = '<option value="">选择省份</option>';
    citySelect.innerHTML = '<option value="">选择城市</option>';
    document.getElementById('vehicleStoreSearch').value = '';

    if (!brand) {
      showToast('请先选择所属品牌', 'warning');
      return;
    }

    // 重新填充省份选项
    var provinces = Object.keys(cityTreeData).sort();
    provinces.forEach(function(province) {
      var option = document.createElement('option');
      option.value = province;
      option.textContent = province;
      provinceSelect.appendChild(option);
    });

    // 渲染门店列表
    renderVehicleStoreList();
  }

  // 省份变更时更新城市列表
  function onVehicleStoreProvinceChange() {
    var province = document.getElementById('vehicleStoreProvince').value;
    var citySelect = document.getElementById('vehicleStoreCity');

    // 重置城市选择
    citySelect.innerHTML = '<option value="">选择城市</option>';

    if (!province) {
      renderVehicleStoreList();
      return;
    }

    var provinceData = cityTreeData[province];
    if (!provinceData || !provinceData.cities) return;

    var cities = Object.keys(provinceData.cities).sort();
    cities.forEach(function(city) {
      var option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });

    // 渲染门店列表
    renderVehicleStoreList();
  }

  // 城市变更时更新门店列表
  function onVehicleStoreCityChange() {
    renderVehicleStoreList();
  }

  // 搜索门店
  function filterVehicleStores() {
    renderVehicleStoreList();
  }

  // 获取当前筛选条件下的门店数据
  function getFilteredVehicleStores() {
    var brand = document.getElementById('vehicleBrandSelect').value;
    var province = document.getElementById('vehicleStoreProvince').value;
    var city = document.getElementById('vehicleStoreCity').value;
    var searchKeyword = document.getElementById('vehicleStoreSearch').value.toLowerCase().trim();

    if (!brand) return [];

    var stores = vehicleStoreData[brand] || [];
    return stores.filter(function(store) {
      // 省份过滤
      if (province && store.province !== province) return false;
      // 城市过滤
      if (city && store.city !== city) return false;
      // 搜索过滤
      if (searchKeyword && store.name.toLowerCase().indexOf(searchKeyword) === -1 && store.id.toLowerCase().indexOf(searchKeyword) === -1) return false;
      return true;
    });
  }

  // 渲染门店列表
  function renderVehicleStoreList() {
    var listContainer = document.getElementById('vehicleStoreList');
    var emptyContainer = document.getElementById('vehicleStoreEmpty');
    var countSpan = document.getElementById('vehicleStoreTotalCount');
    var filteredCountSpan = document.getElementById('vehicleStoreFilteredCount');

    var filteredStores = getFilteredVehicleStores();
    listContainer.innerHTML = '';

    // 更新计数
    countSpan.textContent = filteredStores.length;
    if (filteredCountSpan) filteredCountSpan.textContent = filteredStores.length;

    if (filteredStores.length === 0) {
      listContainer.style.display = 'none';
      emptyContainer.style.display = 'block';
      document.getElementById('vehicleStoreSelectAll').disabled = true;
      return;
    }

    listContainer.style.display = 'block';
    emptyContainer.style.display = 'none';
    document.getElementById('vehicleStoreSelectAll').disabled = false;

    filteredStores.forEach(function(store) {
      var isSelected = vehicleSelectedStoreIds.includes(store.id);
      var div = document.createElement('div');
      div.className = 'store-picker-item' + (isSelected ? ' selected' : '');
      div.setAttribute('data-id', store.id);
      div.onclick = function() { toggleVehicleStore(store.id, store.name); };

      div.innerHTML = '<input type="checkbox" ' + (isSelected ? 'checked' : '') + ' onclick="event.stopPropagation(); toggleVehicleStore(\'' + store.id + '\', \'' + store.name + '\');" style="width: 16px; height: 16px; cursor: pointer;">' +
        '<div class="store-picker-item-main">' +
        '<div class="store-picker-item-name">' + escapeHTML(store.name) + '</div>' +
        '<div class="store-picker-item-meta">' + escapeHTML(store.id + '｜' + store.province + ' ' + store.city + ' ' + store.district) + '</div>' +
        '</div>';

      listContainer.appendChild(div);
    });

    // 更新全选状态
    updateVehicleStoreSelectAllState();
  }

  // 更新全选checkbox状态
  function updateVehicleStoreSelectAllState() {
    var filteredStores = getFilteredVehicleStores();
    var selectAllCheckbox = document.getElementById('vehicleStoreSelectAll');

    if (filteredStores.length === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
      return;
    }

    var selectedInFiltered = filteredStores.filter(function(s) {
      return vehicleSelectedStoreIds.includes(s.id);
    }).length;

    if (selectedInFiltered === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    } else if (selectedInFiltered === filteredStores.length) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    }
  }

  // 全选/取消全选
  function toggleVehicleStoreSelectAll() {
    var selectAllCheckbox = document.getElementById('vehicleStoreSelectAll');
    var filteredStores = getFilteredVehicleStores();
    var isChecked = selectAllCheckbox.checked;

    if (isChecked) {
      // 全选：添加所有筛选结果中未选的门店
      filteredStores.forEach(function(store) {
        if (!vehicleSelectedStoreIds.includes(store.id)) {
          vehicleSelectedStoreIds.push(store.id);
          if (currentEditingSeriesId) {
            syncDealerToSeries(currentEditingSeriesId, toDealerRelationIdFromVehicleStore(store.id), true);
          }
        }
      });
    } else {
      // 取消全选：移除所有筛选结果中的门店
      var filteredIds = filteredStores.map(function(s) { return s.id; });
      if (currentEditingSeriesId) {
        filteredIds.forEach(function(storeId) {
          syncDealerToSeries(currentEditingSeriesId, toDealerRelationIdFromVehicleStore(storeId), false);
        });
      }
      vehicleSelectedStoreIds = vehicleSelectedStoreIds.filter(function(id) {
        return filteredIds.indexOf(id) === -1;
      });
    }

    renderVehicleStoreList();
    updateVehicleSelectedStoresDisplay();
    updateVehicleStoreSelectedCount();
  }

  // 切换单个门店选中状态（双向联动）
  function toggleVehicleStore(storeId, storeName) {
    var index = vehicleSelectedStoreIds.indexOf(storeId);
    var isAdding = false;

    if (index === -1) {
      vehicleSelectedStoreIds.push(storeId);
      isAdding = true;
    } else {
      vehicleSelectedStoreIds.splice(index, 1);
      isAdding = false;
    }

    // 双向联动：同步更新 seriesDealerRelation
    if (currentEditingSeriesId) {
      syncDealerToSeries(currentEditingSeriesId, toDealerRelationIdFromVehicleStore(storeId), isAdding);
    }

    renderVehicleStoreList();
    updateVehicleSelectedStoresDisplay();
    updateVehicleStoreSelectedCount();
  }

  // 更新已选门店计数
  function updateVehicleStoreSelectedCount() {
    document.getElementById('vehicleStoreSelectedCount').textContent = vehicleSelectedStoreIds.length;
  }

  // 更新已选门店标签显示
  function updateVehicleSelectedStoresDisplay() {
    var container = document.getElementById('vehicleSelectedStores');
    var emptyText = document.getElementById('vehicleSelectedEmpty');
    if (!container) return;

    container.innerHTML = '';

    if (vehicleSelectedStoreIds.length === 0) {
      emptyText.style.display = 'block';
      updateVehicleStoreSelectedCount();
      return;
    }

    emptyText.style.display = 'none';

    var brand = document.getElementById('vehicleBrandSelect').value;
    var allStores = brand ? (vehicleStoreData[brand] || []) : [];

    vehicleSelectedStoreIds.forEach(function(storeId) {
      var store = allStores.find(function(s) { return s.id === storeId; });
      if (!store) {
        for (var b in vehicleStoreData) {
          var found = vehicleStoreData[b].find(function(s) { return s.id === storeId; });
          if (found) { store = found; break; }
        }
      }
      var storeName = store ? store.name : ('门店' + storeId);

      var span = document.createElement('span');
      span.className = 'store-picker-tag';
      span.innerHTML = escapeHTML(storeName) + '<span class="remove" onclick="event.stopPropagation(); removeVehicleStore(\'' + storeId + '\')">×</span>';
      container.appendChild(span);
    });

    updateVehicleStoreSelectedCount();
  }

  // 移除已选门店
  function removeVehicleStore(storeId) {
    var index = vehicleSelectedStoreIds.indexOf(storeId);
    if (index !== -1) {
      vehicleSelectedStoreIds.splice(index, 1);
      if (currentEditingSeriesId) {
        syncDealerToSeries(currentEditingSeriesId, toDealerRelationIdFromVehicleStore(storeId), false);
      }
      renderVehicleStoreList();
      updateVehicleSelectedStoresDisplay();
    }
  }

  // 清空所有已选门店
  function clearVehicleSelectedStores() {
    if (currentEditingSeriesId) {
      vehicleSelectedStoreIds.forEach(function(storeId) {
        syncDealerToSeries(currentEditingSeriesId, toDealerRelationIdFromVehicleStore(storeId), false);
      });
    }
    vehicleSelectedStoreIds = [];
    renderVehicleStoreList();
    updateVehicleSelectedStoresDisplay();
    showToast('已清空所有已选专营店', 'info');
  }

  // 打开车系弹窗时初始化门店选择器
  function resetVehicleModalStores() {
    vehicleSelectedStoreIds = [];
    initVehicleStoreSelector();
  }

  function getVehicleModalStoreIdsForSeries(seriesId, brand) {
    var relationIds = (seriesDealerRelation[String(seriesId)] || []).slice();
    var brandStores = vehicleStoreData[brand] || [];
    var ids = [];

    relationIds.forEach(function(id) {
      var storeId = toVehicleStoreIdFromDealerRelation(id, brandStores);
      if (storeId && ids.indexOf(storeId) === -1) ids.push(storeId);
    });

    return ids;
  }

  // ==================== 城市树形管理 ====================

  // 城市树形数据（带编码）
  var cityTreeData = {
    '广东省': {
      code: '440000',
      cities: {
        '深圳市': {
          code: '440300',
          districts: ['福田区', '罗湖区', '南山区', '盐田区', '宝安区', '龙岗区', '龙华区', '坪山区', '光明区', '大鹏新区']
        },
        '广州市': {
          code: '440100',
          districts: ['天河区', '越秀区', '海珠区', '荔湾区', '白云区', '黄埔区', '番禺区', '花都区', '南沙区', '增城区', '从化区']
        },
        '东莞市': {
          code: '441900',
          districts: ['莞城区', '南城区', '东城区', '万江区', '石碣镇', '石龙镇', '茶山镇', '石排镇', '企石镇', '横沥镇']
        },
        '佛山市': {
          code: '440600',
          districts: ['禅城区', '南海区', '顺德区', '三水区', '高明区']
        },
        '珠海市': {
          code: '440400',
          districts: ['香洲区', '斗门区', '金湾区']
        },
        '中山市': {
          code: '442000',
          districts: ['石岐区', '东区', '西区', '南区', '中山港街道']
        },
        '惠州市': {
          code: '441300',
          districts: ['惠城区', '惠阳区', '博罗县', '惠东县', '龙门县']
        },
        '江门市': {
          code: '440700',
          districts: ['蓬江区', '江海区', '新会区', '台山市', '开平市', '鹤山市', '恩平市']
        }
      }
    },
    '北京市': {
      code: '110000',
      cities: {
        '北京市': {
          code: '110100',
          districts: ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区']
        }
      }
    },
    '上海市': {
      code: '310000',
      cities: {
        '上海市': {
          code: '310100',
          districts: ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区']
        }
      }
    },
    '浙江省': {
      code: '330000',
      cities: {
        '杭州市': {
          code: '330100',
          districts: ['上城区', '下城区', '西湖区', '拱墅区', '江干区', '滨江区', '萧山区', '余杭区', '临平区', '钱塘区', '富阳区', '临安区', '桐庐县', '淳安县']
        },
        '宁波市': {
          code: '330200',
          districts: ['海曙区', '江北区', '北仑区', '镇海区', '鄞州区', '奉化区', '余姚市', '慈溪市', '象山县', '宁海县']
        },
        '温州市': {
          code: '330300',
          districts: ['鹿城区', '龙湾区', '瓯海区', '洞头区', '瑞安市', '乐清市', '永嘉县', '平阳县', '苍南县', '文成县', '泰顺县']
        },
        '嘉兴市': {
          code: '330400',
          districts: ['南湖区', '秀洲区', '海宁市', '平湖市', '桐乡市', '嘉善县', '海盐县']
        },
        '湖州市': {
          code: '330500',
          districts: ['吴兴区', '南浔区', '德清县', '长兴县', '安吉县']
        }
      }
    },
    '江苏省': {
      code: '320000',
      cities: {
        '南京市': {
          code: '320100',
          districts: ['玄武区', '秦淮区', '鼓楼区', '建邺区', '栖霞区', '雨花台区', '江宁区', '浦口区', '六合区', '溧水区', '高淳区']
        },
        '苏州市': {
          code: '320500',
          districts: ['姑苏区', '虎丘区', '吴中区', '相城区', '工业园区', '高新区', '吴江区', '常熟市', '张家港市', '昆山市', '太仓市']
        },
        '无锡市': {
          code: '320200',
          districts: ['梁溪区', '锡山区', '惠山区', '滨湖区', '新吴区', '江阴市', '宜兴市']
        }
      }
    },
    '四川省': {
      code: '510000',
      cities: {
        '成都市': {
          code: '510100',
          districts: ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '龙泉驿区', '青白江区', '新都区', '温江区', '双流区', '郫都区', '新津区', '简阳市', '都江堰市', '彭州市', '邛崃市', '崇州市', '大邑县', '蒲江县']
        },
        '绵阳市': {
          code: '510700',
          districts: ['涪城区', '游仙区', '安州区', '三台县', '盐亭县', '梓潼县', '北川县', '平武县', '江油市']
        },
        '德阳市': {
          code: '510600',
          districts: ['旌阳区', '罗江区', '中江县', '广汉市', '什邡市', '绵竹市']
        }
      }
    }
  };

  // 城市树形状态
  var currentCityNode = null;  // 当前选中的节点
  var cityTreeExpanded = {};    // 展开状态记录

  // 渲染城市树
  function renderCityTree() {
    var container = document.getElementById('cityTreeContainer');
    if (!container) return;
    
    var html = '';
    var provinces = Object.keys(cityTreeData).sort();
    
    provinces.forEach(function(province) {
      var provinceData = cityTreeData[province];
      var cities = provinceData.cities || {};
      var cityCount = Object.keys(cities).length;
      var isExpanded = cityTreeExpanded[province] !== false;  // 默认展开
      
      // 省份节点
      html += '<div class="tree-node">';
      html += '<div class="tree-item" data-type="province" data-name="' + province + '" onclick="selectCityNode(this, event)">';
      html += '<span class="tree-toggle ' + (cityCount > 0 ? (isExpanded ? 'expanded' : '') : 'empty') + '" onclick="toggleCityNode(this, event)">▶</span>';
      html += '<span class="tree-icon province">🏠</span>';
      html += '<span class="tree-label">' + province + '</span>';
      html += '<span class="tree-count">' + cityCount + '市</span>';
      html += '<span class="tree-actions">';
      html += '<button class="add-btn" onclick="openCityTreeModal(\'city\', \'' + province + '\')">+</button>';
      html += '<button class="edit-btn" onclick="openCityTreeModal(\'province\', null, \'' + province + '\')">✎</button>';
      html += '<button class="del-btn" onclick="deleteCityNode(\'province\', \'' + province + '\')">×</button>';
      html += '</span>';
      html += '</div>';
      
      // 城市子节点
      html += '<div class="tree-children ' + (isExpanded ? 'expanded' : '') + '">';
      var cityNames = Object.keys(cities).sort();
      cityNames.forEach(function(city) {
        var cityData = cities[city];
        var districts = cityData.districts || [];
        var districtCount = districts.length;
        var cityExpanded = cityTreeExpanded[province + '_' + city] !== false;
        
        html += '<div class="tree-node">';
        html += '<div class="tree-item" data-type="city" data-parent="' + province + '" data-name="' + city + '" onclick="selectCityNode(this, event)">';
        html += '<span class="tree-toggle ' + (districtCount > 0 ? (cityExpanded ? 'expanded' : '') : 'empty') + '" onclick="toggleCityNode(this, event)">▶</span>';
        html += '<span class="tree-icon city">🏙️</span>';
        html += '<span class="tree-label">' + city + '</span>';
        html += '<span class="tree-count">' + districtCount + '区</span>';
        html += '<span class="tree-actions">';
        html += '<button class="add-btn" onclick="openCityTreeModal(\'district\', \'' + province + '\', \'' + city + '\')">+</button>';
        html += '<button class="edit-btn" onclick="openCityTreeModal(\'city\', \'' + province + '\', \'' + city + '\')">✎</button>';
        html += '<button class="del-btn" onclick="deleteCityNode(\'city\', \'' + city + '\', \'' + province + '\')">×</button>';
        html += '</span>';
        html += '</div>';
        
        // 区县子节点
        html += '<div class="tree-children ' + (cityExpanded ? 'expanded' : '') + '">';
        districts.forEach(function(district) {
          var dName = typeof district === 'object' ? district.name : district;
          var dCode = typeof district === 'object' ? district.code : '';
          var dLabel = dCode ? dName + '<span style="font-size:11px;color:var(--gray-400);margin-left:6px;">(' + dCode + ')</span>' : dName;
          html += '<div class="tree-node">';
          html += '<div class="tree-item" data-type="district" data-parent="' + province + '" data-grandparent="' + city + '" data-name="' + dName + '" onclick="selectCityNode(this, event)">';
          html += '<span class="tree-toggle empty"></span>';
          html += '<span class="tree-icon district">📍</span>';
          html += '<span class="tree-label">' + dLabel + '</span>';
          html += '<span class="tree-actions">';
          html += '<button class="edit-btn" onclick="openCityTreeModal(\'district\', \'' + province + '\', \'' + city + '\', \'' + dName + '\')">✎</button>';
          html += '<button class="del-btn" onclick="deleteCityNode(\'district\', \'' + dName + '\', \'' + province + '\', \'' + city + '\')">×</button>';
          html += '</span>';
          html += '</div>';
          html += '</div>';
        });
        html += '</div>';  // 区县容器结束
        html += '</div>';  // 城市节点结束
      });
      html += '</div>';  // 城市列表容器结束
      html += '</div>';  // 省份节点结束
    });
    
    if (provinces.length === 0) {
      html = '<div style="text-align: center; color: var(--gray-400); padding: 40px 0;">暂无数据，请点击右上角"新增省份"</div>';
    }
    
    container.innerHTML = html;
  }

  // 切换节点展开/收起
  function toggleCityNode(element, event) {
    event.stopPropagation();
    var toggle = element;
    var children = toggle.parentElement.nextElementSibling;
    if (children && children.classList.contains('tree-children')) {
      children.classList.toggle('expanded');
      toggle.classList.toggle('expanded');
      
      // 记录展开状态
      var item = toggle.parentElement;
      var type = item.dataset.type;
      var name = item.dataset.name;
      if (type === 'province') {
        cityTreeExpanded[name] = children.classList.contains('expanded');
      } else if (type === 'city') {
        var parent = item.dataset.parent;
        cityTreeExpanded[parent + '_' + name] = children.classList.contains('expanded');
      }
    }
  }

  // 选中节点
  function selectCityNode(element, event) {
    event.stopPropagation();
    // 移除其他选中状态
    document.querySelectorAll('.tree-item.active').forEach(function(item) {
      item.classList.remove('active');
    });
    // 设置当前选中
    element.classList.add('active');
    
    var type = element.dataset.type;
    var name = element.dataset.name;
    var parent = element.dataset.parent;
    var grandparent = element.dataset.grandparent;
    
    // 显示详情
    showCityDetail(type, name, parent, grandparent);
  }

  // 显示城市详情
  function showCityDetail(type, name, parent, grandparent) {
    var panel = document.getElementById('cityDetailPanel');
    var html = '';
    
    if (type === 'province') {
      var data = cityTreeData[name];
      var cityCount = data.cities ? Object.keys(data.cities).length : 0;
      var districtCount = 0;
      if (data.cities) {
        Object.values(data.cities).forEach(function(c) {
          districtCount += (c.districts || []).length;
        });
      }
      html = '<div style="max-width: 400px;">' +
        '<h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;"><span style="font-size: 24px;">🏠</span> ' + name + '</h3>' +
        '<table style="width: 100%; border-collapse: collapse;">' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">类型</td><td style="padding: 10px 0;">省份</td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">编码</td><td style="padding: 10px 0;"><code>' + (data.code || '-') + '</code></td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">下辖城市</td><td style="padding: 10px 0;">' + cityCount + ' 个</td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">下辖区县</td><td style="padding: 10px 0;">' + districtCount + ' 个</td></tr>' +
        '</table>' +
        '</div>';
    } else if (type === 'city') {
      var pData = cityTreeData[parent];
      var cData = pData.cities[name];
      html = '<div style="max-width: 400px;">' +
        '<h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;"><span style="font-size: 24px;">🏙️</span> ' + name + '</h3>' +
        '<table style="width: 100%; border-collapse: collapse;">' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">类型</td><td style="padding: 10px 0;">城市</td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">所属省份</td><td style="padding: 10px 0;">' + parent + '</td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">编码</td><td style="padding: 10px 0;"><code>' + (cData.code || '-') + '</code></td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">下辖区县</td><td style="padding: 10px 0;">' + (cData.districts || []).length + ' 个</td></tr>' +
        '</table>' +
        '</div>';
    } else if (type === 'district') {
      var dCode = '';
      try {
        var dList = cityTreeData[parent].cities[grandparent].districts;
        var dItem = dList.find(function(d) { return (typeof d === 'object' ? d.name : d) === name; });
        dCode = (typeof dItem === 'object' && dItem.code) ? dItem.code : '';
      } catch(e) {}
      html = '<div style="max-width: 400px;">' +
        '<h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;"><span style="font-size: 24px;">📍</span> ' + name + '</h3>' +
        '<table style="width: 100%; border-collapse: collapse;">' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">类型</td><td style="padding: 10px 0;">区县</td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">编码</td><td style="padding: 10px 0;"><code>' + (dCode || '-') + '</code></td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">所属城市</td><td style="padding: 10px 0;">' + grandparent + '</td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">所属省份</td><td style="padding: 10px 0;">' + parent + '</td></tr>' +
        '</table>' +
        '</div>';
    }
    
    panel.innerHTML = html;
  }

  // 打开城市树编辑弹窗
  function openCityTreeModal(type, province, city, district) {
    var modal = document.getElementById('cityTreeModal');
    var title = document.getElementById('cityTreeModalTitle');
    var label = document.getElementById('cityTreeLabel');
    var codeGroup = document.getElementById('cityTreeCodeGroup');
    var parentGroup = document.getElementById('cityTreeParentGroup');
    var nameInput = document.getElementById('cityTreeName');
    var codeInput = document.getElementById('cityTreeCode');
    var parentInput = document.getElementById('cityTreeParent');
    var codeRequired = document.getElementById('cityTreeCodeRequired');
    
    nameInput.value = '';
    codeInput.value = '';
    
    if (type === 'province') {
      if (codeRequired) codeRequired.style.display = 'inline';
      if (city) {
        // 编辑模式
        title.textContent = '编辑省份';
        label.textContent = '省份名称';
        codeGroup.style.display = 'block';
        parentGroup.style.display = 'none';
        nameInput.value = city;
        codeInput.value = cityTreeData[city].code || '';
      } else {
        // 新增模式
        title.textContent = '新增省份';
        label.textContent = '省份名称';
        codeGroup.style.display = 'block';
        parentGroup.style.display = 'none';
      }
    } else if (type === 'city') {
      if (codeRequired) codeRequired.style.display = 'inline';
      if (district) {
        // 编辑模式
        title.textContent = '编辑城市';
        label.textContent = '城市名称';
        codeGroup.style.display = 'block';
        parentGroup.style.display = 'block';
        parentInput.value = province;
        nameInput.value = district;
        codeInput.value = cityTreeData[province].cities[district].code || '';
      } else {
        // 新增模式
        title.textContent = '新增城市';
        label.textContent = '城市名称';
        codeGroup.style.display = 'block';
        parentGroup.style.display = 'block';
        parentInput.value = province;
      }
    } else if (type === 'district') {
      // 区县的上级是城市，只显示城市名
      parentGroup.style.display = 'block';
      parentInput.value = city;
      codeGroup.style.display = 'block';
      if (codeRequired) codeRequired.style.display = 'none';
      if (district) {
        // 编辑模式
        title.textContent = '编辑区县';
        label.textContent = '区县名称';
        nameInput.value = district;
        var dData = cityTreeData[province].cities[city].districts;
        var dItem = dData.find(function(d) { return (typeof d === 'object' ? d.name : d) === district; });
        codeInput.value = (typeof dItem === 'object' && dItem.code) ? dItem.code : '';
      } else {
        // 新增模式
        title.textContent = '新增区县';
        label.textContent = '区县名称';
      }
    }

    modal.dataset.mode = type;
    modal.dataset.province = province || '';
    modal.dataset.city = city || '';
    modal.dataset.originalName = (type === 'district' ? district : city) || '';
    
    openModal('cityTreeModal');
    nameInput.focus();
  }

  // 保存城市树数据
  function saveCityTreeData() {
    var modal = document.getElementById('cityTreeModal');
    var mode = modal.dataset.mode;
    var province = modal.dataset.province;
    var city = modal.dataset.city;
    var originalName = modal.dataset.originalName;
    
    var name = document.getElementById('cityTreeName').value.trim();
    var code = document.getElementById('cityTreeCode').value.trim();
    
    if (!name) {
      showToast('请输入名称', 'error');
      return;
    }
    
    if (mode === 'province') {
      if (originalName && originalName !== name) {
        // 重命名
        var data = cityTreeData[originalName];
        delete cityTreeData[originalName];
        cityTreeData[name] = data;
      } else if (!cityTreeData[name]) {
        cityTreeData[name] = { code: code, cities: {} };
      } else if (originalName !== name) {
        showToast('该省份已存在', 'error');
        return;
      }
      if (code && cityTreeData[name]) cityTreeData[name].code = code;
      showToast('保存成功', 'success');
    } else if (mode === 'city') {
      if (!province || !cityTreeData[province]) {
        showToast('省份数据异常', 'error');
        return;
      }
      if (originalName && originalName !== name) {
        // 重命名
        var data = cityTreeData[province].cities[originalName];
        delete cityTreeData[province].cities[originalName];
        cityTreeData[province].cities[name] = data;
      } else if (!cityTreeData[province].cities[name]) {
        cityTreeData[province].cities[name] = { code: code, districts: [] };
      } else if (originalName !== name) {
        showToast('该城市已存在', 'error');
        return;
      }
      if (code && cityTreeData[province].cities[name]) cityTreeData[province].cities[name].code = code;
      showToast('保存成功', 'success');
    } else if (mode === 'district') {
      if (!province || !cityTreeData[province] || !cityTreeData[province].cities[city]) {
        showToast('城市数据异常', 'error');
        return;
      }
      var districts = cityTreeData[province].cities[city].districts;
      // 查找索引（兼容字符串和对象格式）
      var index = -1;
      for (var i = 0; i < districts.length; i++) {
        var dName = typeof districts[i] === 'object' ? districts[i].name : districts[i];
        if (dName === (originalName || name)) { index = i; break; }
      }
      // 检查名称是否已存在
      var nameExists = false;
      for (var j = 0; j < districts.length; j++) {
        var dName2 = typeof districts[j] === 'object' ? districts[j].name : districts[j];
        if (dName2 === name && dName2 !== originalName) { nameExists = true; break; }
      }
      var newItem = code ? { name: name, code: code } : name;
      if (originalName && originalName !== name) {
        // 重命名
        if (index !== -1) districts.splice(index, 1);
        if (!nameExists) districts.push(newItem);
      } else if (index === -1) {
        districts.push(newItem);
      } else if (nameExists && originalName !== name) {
        showToast('该区县已存在', 'error');
        return;
      } else {
        // 编辑现有项，保留编码
        var existingCode = (typeof districts[index] === 'object' && districts[index].code) ? districts[index].code : '';
        var finalCode = code || existingCode;
        districts[index] = finalCode ? { name: name, code: finalCode } : name;
      }
      showToast('保存成功', 'success');
    }
    
    closeModal('cityTreeModal');
    renderCityTree();
  }

  // 删除城市节点
  function deleteCityNode(type, name, parent, city) {
    var msg = '';
    if (type === 'province') {
      msg = '确认删除省份「' + name + '」吗？\n删除后将同时删除该省下所有城市和区县数据。';
    } else if (type === 'city') {
      msg = '确认删除城市「' + name + '」吗？\n删除后将同时删除该城市下所有区县数据。';
    } else {
      msg = '确认删除区县「' + name + '」吗？';
    }
    
    if (!confirm(msg)) return;
    
    if (type === 'province') {
      delete cityTreeData[name];
    } else if (type === 'city') {
      delete cityTreeData[parent].cities[name];
    } else {
      var districts = cityTreeData[parent].cities[city].districts;
      var index = -1;
      for (var i = 0; i < districts.length; i++) {
        var dName = typeof districts[i] === 'object' ? districts[i].name : districts[i];
        if (dName === name) { index = i; break; }
      }
      if (index !== -1) districts.splice(index, 1);
    }
    
    renderCityTree();
    document.getElementById('cityDetailPanel').innerHTML = '<div style="text-align: center; color: var(--gray-400); padding: 60px 0;"><div style="font-size: 48px; margin-bottom: 16px;">📍</div><p>请从左侧选择省/市/区查看详情</p></div>';
    showToast('删除成功', 'success');
  }

  // 展开全部
  function expandAllCityTree() {
    document.querySelectorAll('.tree-children').forEach(function(el) {
      el.classList.add('expanded');
    });
    document.querySelectorAll('.tree-toggle:not(.empty)').forEach(function(el) {
      el.classList.add('expanded');
    });
  }

  // 收起全部
  function collapseAllCityTree() {
    document.querySelectorAll('.tree-children').forEach(function(el) {
      el.classList.remove('expanded');
    });
    document.querySelectorAll('.tree-toggle').forEach(function(el) {
      el.classList.remove('expanded');
    });
  }

  // 搜索城市树
  function filterCityTree(keyword) {
    if (!keyword) {
      document.querySelectorAll('.tree-node').forEach(function(node) {
        node.style.display = '';
      });
      return;
    }
    
    keyword = keyword.toLowerCase();
    document.querySelectorAll('.tree-item').forEach(function(item) {
      var name = item.dataset.name || '';
      var match = name.toLowerCase().indexOf(keyword) !== -1;
      item.closest('.tree-node').style.display = match ? '' : 'none';
    });
  }

  // 打开导入弹窗
  function openCityTreeImportModal() {
    resetCityTreeImportModal();
    openModal('cityTreeImportModal');
  }

  // 重置导入弹窗
  function resetCityTreeImportModal() {
    document.getElementById('cityImportStep1').className = 'import-step active';
    document.getElementById('cityImportStep2').className = 'import-step';
    document.getElementById('cityImportStep3').className = 'import-step';
    document.getElementById('cityImportLine1').style.background = 'var(--gray-200)';
    document.getElementById('cityImportLine2').style.background = 'var(--gray-200)';
    document.getElementById('cityImportStepContent1').style.display = 'block';
    document.getElementById('cityImportStepContent2').style.display = 'none';
    document.getElementById('cityImportStepContent3').style.display = 'none';
    document.getElementById('cityImportModalFooter').style.display = 'flex';
    document.getElementById('cityImportNextBtn').style.display = 'inline-block';
    document.getElementById('cityImportNextBtn').disabled = true;
    document.getElementById('cityImportNextBtn').textContent = '下一步';
    document.getElementById('citySelectedFileInfo').style.display = 'none';
    document.getElementById('cityImportFile').value = '';
  }

  // 关闭导入弹窗
  function closeCityTreeImportModal() {
    closeModal('cityTreeImportModal');
  }

  // 下载导入模板
  function downloadCityTemplate() {
    var csv = '省份,城市,区县,编码\n广东省,深圳市,,440300\n广东省,深圳市,福田区,\n广东省,深圳市,罗湖区,\n广东省,广州市,,440100\n广东省,广州市,天河区,\n北京市,北京市,,110100\n北京市,北京市,朝阳区,';
    
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '城市数据导入模板.csv';
    link.click();
    showToast('模板下载成功', 'success');
  }

  // 处理导入文件
  function handleCityImportFile(input) {
    var file = input.files[0];
    if (!file) return;
    
    // 显示文件信息
    document.getElementById('citySelectedFileName').textContent = file.name;
    document.getElementById('citySelectedFileSize').textContent = formatFileSize(file.size);
    document.getElementById('citySelectedFileInfo').style.display = 'flex';
    
    // 启用下一步按钮
    document.getElementById('cityImportNextBtn').disabled = false;
    document.getElementById('cityImportNextBtn').dataset.fileContent = '';
    
    // 读取文件内容
    var reader = new FileReader();
    reader.onload = function(e) {
      var content = e.target.result;
      document.getElementById('cityImportNextBtn').dataset.fileContent = content;
    };
    reader.readAsText(file);
  }

  // 重置文件选择
  function resetCityImportFile() {
    document.getElementById('cityImportFile').value = '';
    document.getElementById('citySelectedFileInfo').style.display = 'none';
    document.getElementById('cityImportNextBtn').disabled = true;
    document.getElementById('cityImportNextBtn').dataset.fileContent = '';
  }

  // 格式化文件大小
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // 城市导入下一步
  var cityImportCurrentStep = 1;
  function goCityImportNextStep() {
    if (cityImportCurrentStep === 1) {
      // 从步骤1到步骤2：解析文件并显示预览
      var content = document.getElementById('cityImportNextBtn').dataset.fileContent;
      if (!content) {
        showToast('请先选择文件', 'error');
        return;
      }
      
      // 解析CSV
      var lines = content.split('\n').filter(function(l) { return l.trim(); });
      if (lines.length < 2) {
        showToast('文件格式错误', 'error');
        return;
      }
      
      // 渲染预览表格
      var tbody = document.getElementById('cityImportPreviewBody');
      var html = '';
      var validCount = 0;
      var errorCount = 0;
      
      for (var i = 1; i < lines.length; i++) {
        var cols = lines[i].split(',');
        if (cols.length >= 2 && cols[0].trim()) {
          validCount++;
          html += '<tr style="background: var(--success-light);">' +
            '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + i + '</td>' +
            '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + (cols[0] || '') + '</td>' +
            '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + (cols[1] || '') + '</td>' +
            '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + (cols[2] || '-') + '</td>' +
            '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);"><code>' + (cols[3] || '-') + '</code></td>' +
            '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);"><span style="color: var(--success);">✓ 通过</span></td>' +
            '</tr>';
        }
      }
      
      tbody.innerHTML = html;
      document.getElementById('cityImportDataCount').textContent = validCount;
      
      // 更新步骤指示器
      document.getElementById('cityImportStep1').className = 'import-step';
      document.getElementById('cityImportStep2').className = 'import-step active';
      document.getElementById('cityImportLine1').style.background = 'var(--success)';
      document.getElementById('cityImportStepContent1').style.display = 'none';
      document.getElementById('cityImportStepContent2').style.display = 'block';
      document.getElementById('cityImportNextBtn').textContent = '确认导入';
      cityImportCurrentStep = 2;
      
    } else if (cityImportCurrentStep === 2) {
      // 从步骤2到步骤3：执行导入
      var content = document.getElementById('cityImportNextBtn').dataset.fileContent;
      var lines = content.split('\n').filter(function(l) { return l.trim(); });
      var importCount = lines.length - 1;
      
      // 解析并导入数据
      for (var i = 1; i < lines.length; i++) {
        var cols = lines[i].split(',');
        if (cols.length >= 2 && cols[0].trim()) {
          var province = cols[0].trim();
          var city = cols[1].trim();
          var district = cols.length > 2 ? cols[2].trim() : '';
          var code = cols.length > 3 ? cols[3].trim() : '';
          
          // 写入cityTreeData
          if (!cityTreeData[province]) {
            cityTreeData[province] = { code: code, cities: {} };
          }
          if (city && !cityTreeData[province].cities[city]) {
            cityTreeData[province].cities[city] = { code: code, districts: [] };
          }
          if (district && cityTreeData[province].cities[city]) {
            if (!cityTreeData[province].cities[city].districts) {
              cityTreeData[province].cities[city].districts = [];
            }
            if (!cityTreeData[province].cities[city].districts.includes(district)) {
              cityTreeData[province].cities[city].districts.push(district);
            }
          }
        }
      }
      
      // 保存到localStorage
      localStorage.setItem('cityTreeData', JSON.stringify(cityTreeData));
      
      // 更新步骤指示器
      document.getElementById('cityImportStep2').className = 'import-step';
      document.getElementById('cityImportStep3').className = 'import-step active';
      document.getElementById('cityImportLine2').style.background = 'var(--success)';
      document.getElementById('cityImportStepContent2').style.display = 'none';
      document.getElementById('cityImportStepContent3').style.display = 'block';
      document.getElementById('cityImportModalFooter').style.display = 'none';
      document.getElementById('cityImportCompleteInfo').textContent = '成功导入 ' + importCount + ' 条数据';
      cityImportCurrentStep = 3;
      
      // 刷新城市树
      renderCityTree();
      showToast('导入成功，共导入 ' + importCount + ' 条数据', 'success');
    }
  }

  // 确认导入
  function confirmCityImport() {
    showToast('导入功能开发中，请稍后', 'info');
    closeModal('cityTreeImportModal');
  }

  // 初始化城市树
  function initCityTree() {
    renderCityTree();
  }

  