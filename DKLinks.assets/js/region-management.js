// ===== BRAND REGION MANAGEMENT =====

  // 品牌管理数据源（用于品牌区域中读取品牌列表）
  var brandManagementList = [
    { name: '理想汽车', code: 'LIXIANG' },
    { name: '问界', code: 'AITO' },
    { name: '小鹏汽车', code: 'XIAOPENG' },
    { name: '蔚来', code: 'NIO' },
    { name: '东风日产', code: 'DONGFENG_NISSAN' }
  ];

  // 品牌区域数据
  var brandRegionData = {
    '理想汽车': {
      code: 'LIXIANG',
      regions: {
        '华南大区': {
          code: 'HN',
          subRegions: ['广深小区', '佛莞小区']
        },
        '华东大区': {
          code: 'HD',
          subRegions: ['沪杭小区', '苏锡常小区']
        },
        '华北大大区': {
          code: 'HB',
          subRegions: ['京津小区', '石家庄小区']
        }
      }
    },
    '问界': {
      code: 'AITO',
      regions: {
        '华中大区': {
          code: 'HZ',
          subRegions: ['武汉小区', '长沙小区']
        },
        '西部大区': {
          code: 'XB',
          subRegions: ['成都小区', '重庆小区']
        }
      }
    },
    '小鹏汽车': {
      code: 'XIAOPENG',
      regions: {
        '华南大区': {
          code: 'HN',
          subRegions: ['广佛小区', '深莞小区']
        }
      }
    },
    '东风日产': {
      code: 'DONGFENG_NISSAN',
      regions: {
        '华南大区': {
          code: 'HN',
          subRegions: ['广佛小区', '粤西小区']
        },
        '华东大区': {
          code: 'HD',
          subRegions: ['沪苏小区', '浙皖小区']
        }
      }
    }
  };

  // 品牌区域树形状态
  var regionTreeExpanded = {};    // 展开状态记录
  var regionSelectedCityIds = [];

  function getRegionSubRegionName(item) {
    return typeof item === 'string' ? item : (item && item.name) || '';
  }

  function getRegionSubRegionCityIds(item) {
    return typeof item === 'string' ? [] : ((item && item.cityIds) || []);
  }

  function findRegionSubRegionIndex(list, name) {
    return (list || []).findIndex(function(item) {
      return getRegionSubRegionName(item) === name;
    });
  }

  function getAllRegionCities() {
    var cities = [];
    Object.keys(cityTreeData).sort().forEach(function(province) {
      var cityMap = cityTreeData[province].cities || {};
      Object.keys(cityMap).sort().forEach(function(city) {
        cities.push({
          id: province + '|' + city,
          province: province,
          name: city,
          code: cityMap[city].code || ''
        });
      });
    });
    return cities;
  }

  function getRegionCityLabel(cityId) {
    var parts = cityId.split('|');
    return parts.length === 2 ? parts[1] + ' / ' + parts[0] : cityId;
  }

  // 渲染品牌区域树
  function renderRegionTree() {
    var container = document.getElementById('regionTreeContainer');
    if (!container) return;
    
    var html = '';
    var brands = Object.keys(brandRegionData).sort();
    
    brands.forEach(function(brand) {
      var brandData = brandRegionData[brand];
      var regions = brandData.regions || {};
      var regionCount = Object.keys(regions).length;
      var isExpanded = regionTreeExpanded[brand] !== false;  // 默认展开
      
      // 品牌节点
      html += '<div class="tree-node">';
      html += '<div class="tree-item" data-type="brand" data-name="' + brand + '" onclick="selectRegionNode(this, event)">';
      html += '<span class="tree-toggle ' + (regionCount > 0 ? (isExpanded ? 'expanded' : '') : 'empty') + '" onclick="toggleRegionNode(this, event)">▶</span>';
      html += '<span class="tree-icon brand">🏢</span>';
      html += '<span class="tree-label">' + brand + '</span>';
      html += '<span class="tree-count">' + regionCount + '区</span>';
      html += '<span class="tree-actions">';
      html += '<button class="add-btn" data-title="新增大区" onclick="openRegionModal(\'region\', \'' + brand + '\')">+</button>';
      html += '<button class="edit-btn" data-title="编辑" onclick="openRegionModal(\'brand\', null, \'' + brand + '\')">✎</button>';
      html += '<button class="del-btn" data-title="删除" onclick="deleteRegionNode(\'brand\', \'' + brand + '\')">×</button>';
      html += '</span>';
      html += '</div>';

      // 大区子节点
      html += '<div class="tree-children ' + (isExpanded ? 'expanded' : '') + '">';
      var regionNames = Object.keys(regions).sort();
      regionNames.forEach(function(region) {
        var regionData = regions[region];
        var subRegions = regionData.subRegions || [];
        var subRegionCount = subRegions.length;
        var regionExpanded = regionTreeExpanded[brand + '_' + region] !== false;

        html += '<div class="tree-node">';
        html += '<div class="tree-item" data-type="region" data-parent="' + brand + '" data-name="' + region + '" onclick="selectRegionNode(this, event)">';
        html += '<span class="tree-toggle ' + (subRegionCount > 0 ? (regionExpanded ? 'expanded' : '') : 'empty') + '" onclick="toggleRegionNode(this, event)">▶</span>';
        html += '<span class="tree-icon region">📍</span>';
        html += '<span class="tree-label">' + region + '</span>';
        html += '<span class="tree-count">' + subRegionCount + '小区</span>';
        html += '<span class="tree-actions">';
        html += '<button class="add-btn" data-title="新增小区" onclick="openRegionModal(\'subregion\', \'' + brand + '\', \'' + region + '\')">+</button>';
        html += '<button class="edit-btn" data-title="编辑" onclick="openRegionModal(\'region\', \'' + brand + '\', \'' + region + '\')">✎</button>';
        html += '<button class="del-btn" data-title="删除" onclick="deleteRegionNode(\'region\', \'' + region + '\', \'' + brand + '\')">×</button>';
        html += '</span>';
        html += '</div>';
        
        // 小区子节点
        html += '<div class="tree-children ' + (regionExpanded ? 'expanded' : '') + '">';
        subRegions.forEach(function(subRegionItem) {
          var subRegion = getRegionSubRegionName(subRegionItem);
          html += '<div class="tree-node">';
          html += '<div class="tree-item" data-type="subregion" data-parent="' + brand + '" data-grandparent="' + region + '" data-name="' + subRegion + '" onclick="selectRegionNode(this, event)">';
          html += '<span class="tree-toggle empty"></span>';
          html += '<span class="tree-icon subregion">🏪</span>';
          html += '<span class="tree-label">' + subRegion + '</span>';
          html += '<span class="tree-actions">';
          html += '<button class="edit-btn" data-title="编辑" onclick="openRegionModal(\'subregion\', \'' + brand + '\', \'' + region + '\', \'' + subRegion + '\')">✎</button>';
          html += '<button class="del-btn" data-title="删除" onclick="deleteRegionNode(\'subregion\', \'' + subRegion + '\', \'' + brand + '\', \'' + region + '\')">×</button>';
          html += '</span>';
          html += '</div>';
          html += '</div>';
        });
        html += '</div>';  // 小区容器结束
        html += '</div>';  // 大区节点结束
      });
      html += '</div>';  // 大区列表容器结束
      html += '</div>';  // 品牌节点结束
    });
    
    if (brands.length === 0) {
      html = '<div style="text-align: center; color: var(--gray-400); padding: 40px 0;">暂无数据，请点击右上角"新增品牌"</div>';
    }

    container.innerHTML = html;
  }

  // 切换节点展开/收起
  function toggleRegionNode(element, event) {
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
      if (type === 'brand') {
        regionTreeExpanded[name] = children.classList.contains('expanded');
      } else if (type === 'region') {
        var parent = item.dataset.parent;
        regionTreeExpanded[parent + '_' + name] = children.classList.contains('expanded');
      }
    }
  }

  // 选中节点
  function selectRegionNode(element, event) {
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
    showRegionDetail(type, name, parent, grandparent);
  }

  // 显示区域详情
  function showRegionDetail(type, name, parent, grandparent) {
    var panel = document.getElementById('regionDetailPanel');
    var html = '';
    
    if (type === 'brand') {
      var data = brandRegionData[name];
      var regionCount = data.regions ? Object.keys(data.regions).length : 0;
      var subRegionCount = 0;
      if (data.regions) {
        Object.values(data.regions).forEach(function(r) {
          subRegionCount += (r.subRegions || []).length;
        });
      }
      html = '<div style="max-width: 400px;">' +
        '<h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;"><span style="font-size: 24px;">🏢</span> ' + name + '</h3>' +
        '<table style="width: 100%; border-collapse: collapse;">' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">类型</td><td style="padding: 10px 0;">品牌</td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">编码</td><td style="padding: 10px 0;"><code>' + (data.code || '-') + '</code></td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">下辖大区</td><td style="padding: 10px 0;">' + regionCount + ' 个</td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">下辖小区</td><td style="padding: 10px 0;">' + subRegionCount + ' 个</td></tr>' +
        '</table>' +
        '</div>';
    } else if (type === 'region') {
      var bData = brandRegionData[parent];
      var rData = bData.regions[name];
      html = '<div style="max-width: 400px;">' +
        '<h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;"><span style="font-size: 24px;">📍</span> ' + name + '</h3>' +
        '<table style="width: 100%; border-collapse: collapse;">' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">类型</td><td style="padding: 10px 0;">大区</td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">所属品牌</td><td style="padding: 10px 0;">' + parent + '</td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">编码</td><td style="padding: 10px 0;"><code>' + (rData.code || '-') + '</code></td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">下辖小区</td><td style="padding: 10px 0;">' + (rData.subRegions || []).length + ' 个</td></tr>' +
        '</table>' +
        '</div>';
    } else if (type === 'subregion') {
      var subList = brandRegionData[parent]?.regions?.[grandparent]?.subRegions || [];
      var subIdx = findRegionSubRegionIndex(subList, name);
      var subData = subIdx >= 0 ? subList[subIdx] : name;
      var cityIds = getRegionSubRegionCityIds(subData);
      var cityLabels = cityIds.map(getRegionCityLabel);
      html = '<div style="max-width: 400px;">' +
        '<h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;"><span style="font-size: 24px;">🏪</span> ' + name + '</h3>' +
        '<table style="width: 100%; border-collapse: collapse;">' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">类型</td><td style="padding: 10px 0;">小区</td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">所属大区</td><td style="padding: 10px 0;">' + grandparent + '</td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">所属品牌</td><td style="padding: 10px 0;">' + parent + '</td></tr>' +
        '<tr style="border-bottom: 1px solid var(--gray-200);"><td style="padding: 10px 0; color: var(--gray-500);">关联城市</td><td style="padding: 10px 0;">' + (cityLabels.length ? cityLabels.join('、') : '-') + '</td></tr>' +
        '</table>' +
        '</div>';
    }
    
    panel.innerHTML = html;
  }

  // 打开区域编辑弹窗
  function openRegionModal(type, brand, region, subRegion) {
    var modal = document.getElementById('regionModal');
    var title = document.getElementById('regionModalTitle');
    var label = document.getElementById('regionLabel');
    var codeGroup = document.getElementById('regionCodeGroup');
    var parentGroup = document.getElementById('regionParentGroup');
    var nameInput = document.getElementById('regionName');
    var nameSelect = document.getElementById('regionNameSelect');
    var codeInput = document.getElementById('regionCode');
    var parentInput = document.getElementById('regionParent');
    var cityGroup = document.getElementById('regionCityGroup');

    nameInput.value = '';
    codeInput.value = '';
    codeInput.readOnly = false;
    codeInput.style.background = '';
    parentInput.value = '';
    if (nameSelect) nameSelect.value = '';
    regionSelectedCityIds = [];
    if (cityGroup) cityGroup.style.display = 'none';

    if (type === 'brand') {
      if (brand) {
        // 编辑品牌
        title.textContent = '编辑品牌';
        label.textContent = '品牌名称';
        codeGroup.style.display = 'block';
        parentGroup.style.display = 'none';
        nameInput.style.display = 'block';
        if (nameSelect) nameSelect.style.display = 'none';
        nameInput.value = brand;
        nameInput.readOnly = true;
        nameInput.style.background = 'var(--gray-100)';
        codeInput.readOnly = false;
        codeInput.style.background = '';
        codeInput.value = brandRegionData[brand]?.code || '';
      } else {
        // 新增品牌：名称从品牌管理数据下拉选择
        title.textContent = '新增品牌';
        label.textContent = '品牌名称';
        codeGroup.style.display = 'block';
        parentGroup.style.display = 'none';
        nameInput.style.display = 'none';
        if (nameSelect) {
          nameSelect.style.display = 'block';
          nameSelect.innerHTML = '<option value="">请选择品牌</option>';
          brandManagementList.forEach(function(item) {
            // 排除已在品牌区域中存在的数据
            if (!brandRegionData[item.name]) {
              var opt = document.createElement('option');
              opt.value = item.name;
              opt.textContent = item.name;
              nameSelect.appendChild(opt);
            }
          });
          nameSelect.onchange = function() {
            var selected = brandManagementList.find(function(item) {
              return item.name === nameSelect.value;
            });
            codeInput.value = selected ? selected.code : '';
            codeInput.readOnly = !!selected;
            codeInput.style.background = selected ? 'var(--gray-100)' : '';
          };
        }
      }
    } else if (type === 'region') {
      nameInput.style.display = 'block';
      nameInput.readOnly = false;
      nameInput.style.background = '';
      codeInput.readOnly = false;
      codeInput.style.background = '';
      if (nameSelect) nameSelect.style.display = 'none';
      if (region) {
        // 编辑大区
        title.textContent = '编辑大区';
        label.textContent = '大区名称';
        codeGroup.style.display = 'block';
        parentGroup.style.display = 'block';
        parentInput.value = brand;
        nameInput.value = region;
        codeInput.value = brandRegionData[brand]?.regions[region]?.code || '';
      } else {
        // 新增大区
        title.textContent = '新增大区';
        label.textContent = '大区名称';
        codeGroup.style.display = 'block';
        parentGroup.style.display = 'block';
        parentInput.value = brand;
      }
    } else if (type === 'subregion') {
      nameInput.style.display = 'block';
      nameInput.readOnly = false;
      nameInput.style.background = '';
      codeInput.readOnly = false;
      codeInput.style.background = '';
      if (nameSelect) nameSelect.style.display = 'none';
      if (subRegion) {
        // 编辑小区
        title.textContent = '编辑小区';
        label.textContent = '小区名称';
        codeGroup.style.display = 'none';
        parentGroup.style.display = 'block';
        parentInput.value = region;
        nameInput.value = subRegion;
        var subList = brandRegionData[brand]?.regions?.[region]?.subRegions || [];
        var subIdx = findRegionSubRegionIndex(subList, subRegion);
        if (subIdx >= 0) regionSelectedCityIds = getRegionSubRegionCityIds(subList[subIdx]).slice();
      } else {
        // 新增小区
        title.textContent = '新增小区';
        label.textContent = '小区名称';
        codeGroup.style.display = 'none';
        parentGroup.style.display = 'block';
        parentInput.value = region;
      }
      if (cityGroup) {
        cityGroup.style.display = 'block';
        initRegionCityPicker();
      }
    }
    
    // 存储当前编辑类型和数据
    modal.dataset.editType = type;
    modal.dataset.brand = brand || '';
    modal.dataset.region = region || '';
    modal.dataset.subRegion = subRegion || '';
    
    openModal('regionModal');
  }

  function initRegionCityPicker() {
    var provinceSelect = document.getElementById('regionCityProvince');
    if (!provinceSelect) return;
    provinceSelect.innerHTML = '<option value="">先选择省份</option>';
    Object.keys(cityTreeData).sort().forEach(function(province) {
      var opt = document.createElement('option');
      opt.value = province;
      opt.textContent = province;
      provinceSelect.appendChild(opt);
    });
    document.getElementById('regionCitySearch').value = '';
    renderRegionCityList();
    updateRegionSelectedCityTags();
  }

  function onRegionCityProvinceChange() {
    renderRegionCityList();
  }

  function getFilteredRegionCities() {
    var province = document.getElementById('regionCityProvince').value;
    var keyword = document.getElementById('regionCitySearch').value.trim().toLowerCase();
    if (!province) return [];
    var cityMap = cityTreeData[province]?.cities || {};
    return Object.keys(cityMap).sort().filter(function(city) {
      return !keyword || city.toLowerCase().indexOf(keyword) > -1 || (cityMap[city].code || '').toLowerCase().indexOf(keyword) > -1;
    }).map(function(city) {
      return {
        id: province + '|' + city,
        province: province,
        name: city,
        code: cityMap[city].code || ''
      };
    });
  }

  function renderRegionCityList() {
    var container = document.getElementById('regionCityList');
    if (!container) return;
    var province = document.getElementById('regionCityProvince').value;
    if (!province) {
      container.innerHTML = '<div style="padding:18px;text-align:center;color:var(--gray-400);font-size:13px;">请先选择省份</div>';
      return;
    }
    var cities = getFilteredRegionCities();
    if (cities.length === 0) {
      container.innerHTML = '<div style="padding:18px;text-align:center;color:var(--gray-400);font-size:13px;">暂无匹配城市</div>';
      return;
    }
    container.innerHTML = cities.map(function(city) {
      var checked = regionSelectedCityIds.indexOf(city.id) >= 0;
      return '<div class="region-city-item' + (checked ? ' selected' : '') + '" onclick="toggleRegionCity(\'' + city.id + '\')">' +
        '<input type="checkbox" ' + (checked ? 'checked' : '') + ' style="pointer-events:none;">' +
        '<span style="flex:1;">' + city.name + '</span>' +
        '<span style="font-size:11px;color:var(--gray-400);">' + (city.code || '-') + ' | ' + city.province + '</span>' +
      '</div>';
    }).join('');
  }

  function toggleRegionCity(cityId) {
    var idx = regionSelectedCityIds.indexOf(cityId);
    if (idx >= 0) regionSelectedCityIds.splice(idx, 1);
    else regionSelectedCityIds.push(cityId);
    renderRegionCityList();
    updateRegionSelectedCityTags();
  }

  function selectAllRegionCities() {
    var cities = getFilteredRegionCities();
    cities.forEach(function(city) {
      if (regionSelectedCityIds.indexOf(city.id) < 0) regionSelectedCityIds.push(city.id);
    });
    renderRegionCityList();
    updateRegionSelectedCityTags();
  }

  function clearRegionSelectedCities() {
    regionSelectedCityIds = [];
    renderRegionCityList();
    updateRegionSelectedCityTags();
  }

  function updateRegionSelectedCityTags() {
    var countEl = document.getElementById('regionCitySelectedCount');
    var tagEl = document.getElementById('regionSelectedCityTags');
    if (countEl) countEl.textContent = '已选 ' + regionSelectedCityIds.length + ' 个城市';
    if (!tagEl) return;
    tagEl.innerHTML = regionSelectedCityIds.map(function(id) {
      return '<span class="schedule-store-tag">' + getRegionCityLabel(id) + ' <span class="remove" onclick="event.stopPropagation();toggleRegionCity(\'' + id + '\')">×</span></span>';
    }).join('');
  }

  // 保存区域数据
  function saveRegionData() {
    var modal = document.getElementById('regionModal');
    var type = modal.dataset.editType;
    var brand = modal.dataset.brand;
    var region = modal.dataset.region;
    var subRegion = modal.dataset.subRegion;
    var nameInput = document.getElementById('regionName');
    var nameSelect = document.getElementById('regionNameSelect');
    var name = '';
    if (nameSelect && nameSelect.style.display !== 'none') {
      name = nameSelect.value.trim();
    } else {
      name = nameInput.value.trim();
    }
    var code = document.getElementById('regionCode').value.trim();

    if (!name) {
      showToast('请输入名称', 'error');
      return;
    }

    if (type === 'brand') {
      if (brand) {
        // 编辑品牌
        if (brandRegionData[name] && name !== brand) {
          showToast('品牌名称已存在', 'error');
          return;
        }
        brandRegionData[name] = brandRegionData[brand];
        brandRegionData[name].code = code;
        delete brandRegionData[brand];
      } else {
        // 新增品牌
        if (brandRegionData[name]) {
          showToast('品牌名称已存在', 'error');
          return;
        }
        brandRegionData[name] = { code: code, regions: {} };
      }
      showToast('保存成功', 'success');
    } else if (type === 'region') {
      var bData = brandRegionData[brand];
      if (!bData) {
        showToast('品牌不存在', 'error');
        return;
      }
      if (region) {
        // 编辑大区
        if (bData.regions[name] && name !== region) {
          showToast('大区名称已存在', 'error');
          return;
        }
        bData.regions[name] = bData.regions[region];
        bData.regions[name].code = code;
        delete bData.regions[region];
      } else {
        // 新增大区
        if (bData.regions[name]) {
          showToast('大区名称已存在', 'error');
          return;
        }
        bData.regions[name] = { code: code, subRegions: [] };
      }
      showToast('保存成功', 'success');
    } else if (type === 'subregion') {
      var brData = brandRegionData[brand];
      if (!brData || !brData.regions[region]) {
        showToast('大区不存在', 'error');
        return;
      }
      if (!brData.regions[region].subRegions) {
        brData.regions[region].subRegions = [];
      }
      var subRegions = brData.regions[region].subRegions;
      if (subRegion) {
        // 编辑小区
        var idx = findRegionSubRegionIndex(subRegions, subRegion);
        if (idx !== -1) {
          var duplicateIdx = findRegionSubRegionIndex(subRegions, name);
          if (duplicateIdx !== -1 && duplicateIdx !== idx) {
            showToast('小区名称已存在', 'error');
            return;
          }
          subRegions[idx] = { name: name, cityIds: regionSelectedCityIds.slice() };
        }
      } else {
        // 新增小区
        if (findRegionSubRegionIndex(subRegions, name) !== -1) {
          showToast('小区名称已存在', 'error');
          return;
        }
        subRegions.push({ name: name, cityIds: regionSelectedCityIds.slice() });
      }
      showToast('保存成功', 'success');
    }
    
    closeModal('regionModal');
    renderRegionTree();
  }

  // ========== 品牌区域批量导入功能 ==========
  
  var regionImportCurrentStep = 1;
  var regionImportWorkbook = null;
  
  // 打开导入弹窗
  function openRegionImportModal() {
    resetRegionImportModal();
    openModal('regionImportModal');
  }
  
  // 关闭导入弹窗
  function closeRegionImportModal() {
    closeModal('regionImportModal');
  }
  
  // 重置导入弹窗
  function resetRegionImportModal() {
    regionImportCurrentStep = 1;
    regionImportWorkbook = null;
    
    // 重置步骤指示器
    document.getElementById('regionImportStep1').className = 'import-step active';
    document.getElementById('regionImportStep2').className = 'import-step';
    document.getElementById('regionImportStep3').className = 'import-step';
    document.getElementById('regionImportLine1').style.background = 'var(--gray-200)';
    document.getElementById('regionImportLine2').style.background = 'var(--gray-200)';
    
    // 显示/隐藏步骤内容
    document.getElementById('regionImportStepContent1').style.display = 'block';
    document.getElementById('regionImportStepContent2').style.display = 'none';
    document.getElementById('regionImportStepContent3').style.display = 'none';
    
    // 重置按钮
    document.getElementById('regionImportNextBtn').textContent = '下一步';
    document.getElementById('regionImportNextBtn').disabled = true;
    document.getElementById('regionImportModalFooter').style.display = 'flex';
    
    // 重置文件
    resetRegionImportFile();
  }
  
  // 处理导入文件
  function handleRegionImportFile(input) {
    var file = input.files[0];
    if (!file) return;
    
    var ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      showToast('请上传 Excel 或 CSV 文件', 'error');
      return;
    }
    
    // 显示文件信息
    document.getElementById('regionSelectedFileName').textContent = file.name;
    document.getElementById('regionSelectedFileSize').textContent = formatFileSize(file.size);
    document.getElementById('regionSelectedFileInfo').style.display = 'flex';
    
    // 读取文件
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = new Uint8Array(e.target.result);
        regionImportWorkbook = XLSX.read(data, { type: 'array', cellDates: true });
        document.getElementById('regionImportNextBtn').disabled = false;
        showToast('文件读取成功，请点击下一步预览数据', 'success');
      } catch (err) {
        showToast('文件读取失败：' + err.message, 'error');
        resetRegionImportFile();
      }
    };
    reader.readAsArrayBuffer(file);
  }
  
  // 重置文件选择
  function resetRegionImportFile() {
    document.getElementById('regionImportFile').value = '';
    document.getElementById('regionSelectedFileInfo').style.display = 'none';
    document.getElementById('regionImportNextBtn').disabled = true;
    regionImportWorkbook = null;
  }
  
  // 格式化文件大小
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  
  // 品牌区域导入下一步
  function goRegionImportNextStep() {
    if (regionImportCurrentStep === 1) {
      // 步骤1 -> 步骤2：解析并预览
      if (!regionImportWorkbook) {
        showToast('请先选择文件', 'error');
        return;
      }
      
      var sheet = regionImportWorkbook.Sheets[regionImportWorkbook.SheetNames[0]];
      var jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      
      if (jsonData.length < 2) {
        showToast('文件数据为空或格式错误', 'error');
        return;
      }
      
      // 检查表头
      var header = jsonData[0].map(function(h) { return String(h).trim(); });
      var requiredCols = ['品牌名称', '品牌编码', '大区名称', '大区编码', '小区名称'];
      var colIndex = {};
      for (var i = 0; i < requiredCols.length; i++) {
        var idx = header.findIndex(function(h) { return h === requiredCols[i] || h.includes(requiredCols[i]); });
        if (idx === -1) {
          // 尝试英文表头
          var enCols = ['Brand', 'BrandCode', 'Region', 'RegionCode', 'SubRegion'];
          idx = header.findIndex(function(h) { return h === enCols[i]; });
        }
        colIndex[requiredCols[i]] = idx;
      }
      
      // 解析数据行
      var tbody = document.getElementById('regionImportPreviewBody');
      var html = '';
      var successCount = 0;
      var failCount = 0;
      
      for (var i = 1; i < jsonData.length; i++) {
        var row = jsonData[i];
        if (!row || row.length === 0 || !String(row[0] || '').trim()) continue;
        
        var brand = String(row[colIndex['品牌名称']] || '').trim();
        var brandCode = String(row[colIndex['品牌编码']] || '').trim();
        var regionName = String(row[colIndex['大区名称']] || '').trim();
        var regionCode = String(row[colIndex['大区编码']] || '').trim();
        var subRegionName = String(row[colIndex['小区名称']] || '').trim();
        
        // 校验
        var errors = [];
        if (!brand) errors.push('品牌名称不能为空');
        if (!regionName) errors.push('大区名称不能为空');
        
        var isValid = errors.length === 0;
        var bgColor = isValid ? 'var(--success-light)' : 'var(--danger-light)';
        var statusText = isValid ? '<span style="color: var(--success);">✓ 通过</span>' : '<span style="color: var(--danger);">✗ ' + errors[0] + '</span>';
        
        if (isValid) successCount++; else failCount++;
        
        html += '<tr style="background: ' + bgColor + ';">' +
          '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + (i + 1) + '</td>' +
          '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + brand + '</td>' +
          '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);"><code>' + brandCode + '</code></td>' +
          '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + regionName + '</td>' +
          '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);"><code>' + regionCode + '</code></td>' +
          '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + subRegionName + '</td>' +
          '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + statusText + '</td>' +
          '</tr>';
      }
      
      tbody.innerHTML = html;
      document.getElementById('regionImportDataCount').textContent = successCount + failCount;
      document.getElementById('regionImportSuccessCount').textContent = successCount;
      document.getElementById('regionImportFailCount').textContent = failCount;
      
      if (failCount > 0) {
        document.getElementById('regionImportErrorText').textContent = '有 ' + failCount + ' 条数据校验失败';
        document.getElementById('regionImportErrorText').style.display = 'inline';
      }
      
      // 更新步骤指示器
      document.getElementById('regionImportStep1').className = 'import-step completed';
      document.getElementById('regionImportStep2').className = 'import-step active';
      document.getElementById('regionImportLine1').style.background = 'var(--success)';
      document.getElementById('regionImportStepContent1').style.display = 'none';
      document.getElementById('regionImportStepContent2').style.display = 'block';
      document.getElementById('regionImportNextBtn').textContent = '确认导入';
      document.getElementById('regionImportNextBtn').disabled = false;
      regionImportCurrentStep = 2;
      
    } else if (regionImportCurrentStep === 2) {
      // 步骤2 -> 步骤3：执行导入
      var sheet = regionImportWorkbook.Sheets[regionImportWorkbook.SheetNames[0]];
      var jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      
      var header = jsonData[0].map(function(h) { return String(h).trim(); });
      var colIndex = {};
      var requiredCols = ['品牌名称', '品牌编码', '大区名称', '大区编码', '小区名称'];
      for (var i = 0; i < requiredCols.length; i++) {
        var idx = header.findIndex(function(h) { return h === requiredCols[i] || h.includes(requiredCols[i]); });
        if (idx === -1) {
          var enCols = ['Brand', 'BrandCode', 'Region', 'RegionCode', 'SubRegion'];
          idx = header.findIndex(function(h) { return h === enCols[i]; });
        }
        colIndex[requiredCols[i]] = idx;
      }
      
      var importCount = 0;
      var skipCount = 0;
      
      for (var i = 1; i < jsonData.length; i++) {
        var row = jsonData[i];
        if (!row || row.length === 0 || !String(row[0] || '').trim()) continue;
        
        var brand = String(row[colIndex['品牌名称']] || '').trim();
        var brandCode = String(row[colIndex['品牌编码']] || '').trim();
        var regionName = String(row[colIndex['大区名称']] || '').trim();
        var regionCode = String(row[colIndex['大区编码']] || '').trim();
        var subRegionName = String(row[colIndex['小区名称']] || '').trim();
        
        if (!brand || !regionName) {
          skipCount++;
          continue;
        }
        
        // 写入 brandRegionData
        if (!brandRegionData[brand]) {
          brandRegionData[brand] = { code: brandCode, regions: {} };
        } else {
          if (brandCode) brandRegionData[brand].code = brandCode;
        }
        
        if (!brandRegionData[brand].regions[regionName]) {
          brandRegionData[brand].regions[regionName] = { code: regionCode, subRegions: [] };
        } else {
          if (regionCode) brandRegionData[brand].regions[regionName].code = regionCode;
        }
        
        if (subRegionName && findRegionSubRegionIndex(brandRegionData[brand].regions[regionName].subRegions, subRegionName) === -1) {
          brandRegionData[brand].regions[regionName].subRegions.push(subRegionName);
        }
        
        importCount++;
      }
      
      // 保存到localStorage
      localStorage.setItem('brandRegionData', JSON.stringify(brandRegionData));
      
      // 更新步骤指示器
      document.getElementById('regionImportStep2').className = 'import-step completed';
      document.getElementById('regionImportStep3').className = 'import-step active';
      document.getElementById('regionImportLine2').style.background = 'var(--success)';
      document.getElementById('regionImportStepContent2').style.display = 'none';
      document.getElementById('regionImportStepContent3').style.display = 'block';
      document.getElementById('regionImportModalFooter').style.display = 'none';
      
      var completeText = '成功导入 ' + importCount + ' 条数据';
      if (skipCount > 0) completeText += '，跳过 ' + skipCount + ' 条无效数据';
      document.getElementById('regionImportCompleteInfo').textContent = completeText;
      
      regionImportCurrentStep = 3;
      
      // 刷新树形结构
      renderRegionTree();
      showToast('导入成功，共导入 ' + importCount + ' 条数据', 'success');
    }
  }
  
  // 下载品牌区域导入模板
  function downloadRegionTemplate() {
    var templateData = [
      ['品牌名称', '品牌编码', '大区名称', '大区编码', '小区名称'],
      ['理想汽车', 'LIXIANG', '华南大区', 'HN', '广深小区'],
      ['理想汽车', 'LIXIANG', '华南大区', 'HN', '佛莞小区'],
      ['理想汽车', 'LIXIANG', '华东大区', 'HD', '沪杭小区'],
      ['问界', 'AITO', '华中大区', 'HZ', '武汉小区'],
      ['小鹏汽车', 'XIAOPENG', '华南大区', 'HN', '广佛小区'],
    ];
    
    var ws = XLSX.utils.aoa_to_sheet(templateData);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '品牌区域');
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 15 },  // 品牌名称
      { wch: 12 },  // 品牌编码
      { wch: 12 },  // 大区名称
      { wch: 10 },  // 大区编码
      { wch: 15 },  // 小区名称
    ];
    
    XLSX.writeFile(wb, '品牌区域导入模板.xlsx');
    showToast('模板下载成功', 'success');
  }

  // 导出城市数据（异步）
  function exportCityData() {
    var timestamp = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
    var fileName = '城市数据_' + timestamp + '.xlsx';

    doAsyncExport({
      title: '正在导出城市数据...',
      description: '正在整理省市区三级数据',
      fileName: fileName,
      steps: [
        { percent: 20, status: '正在收集省份数据...', delay: 400 },
        { percent: 50, status: '正在整理城市数据...', delay: 500 },
        { percent: 80, status: '正在处理区县数据...', delay: 400 },
        { percent: 95, status: '即将完成...', delay: 200 }
      ],
      dataPrepare: function() {
        // 数据准备在主线程完成，异步只处理UI
      },
      download: function() {
        var exportData = [];
        exportData.push(['省份', '省份编码', '城市', '城市编码', '区县', '区县编码']);

        var provinces = Object.keys(cityTreeData).sort();
        provinces.forEach(function(province) {
          var pData = cityTreeData[province];
          var cities = pData.cities || {};
          var cityList = Object.keys(cities).sort();

          if (cityList.length === 0) {
            exportData.push([province, pData.code || '', '', '', '', '']);
          } else {
            cityList.forEach(function(city) {
              var cData = cities[city];
              var districts = cData.districts || [];

              if (districts.length === 0) {
                exportData.push([province, pData.code || '', city, cData.code || '', '', '']);
              } else {
                districts.forEach(function(district) {
                  var dCode = cData.districtCodes ? cData.districtCodes[district] : '';
                  exportData.push([province, pData.code || '', city, cData.code || '', district, dCode]);
                });
              }
            });
          }
        });

        var ws = XLSX.utils.aoa_to_sheet(exportData);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '城市数据');

        ws['!cols'] = [
          { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }
        ];

        XLSX.writeFile(wb, fileName);
        showToast('导出成功，共 ' + (exportData.length - 1) + ' 条数据', 'success');
      }
    });
  }

  // 导出品牌区域数据（异步）
  function exportRegionData() {
    var timestamp = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
    var fileName = '品牌区域_' + timestamp + '.xlsx';

    doAsyncExport({
      title: '正在导出品牌区域数据...',
      description: '正在整理品牌大区小区数据',
      fileName: fileName,
      steps: [
        { percent: 20, status: '正在收集品牌数据...', delay: 400 },
        { percent: 50, status: '正在整理大区数据...', delay: 500 },
        { percent: 80, status: '正在处理小区数据...', delay: 400 },
        { percent: 95, status: '即将完成...', delay: 200 }
      ],
      download: function() {
        var exportData = [];
        exportData.push(['品牌名称', '品牌编码', '大区名称', '大区编码', '小区名称', '小区编码']);

        var brands = Object.keys(brandRegionData).sort();
        brands.forEach(function(brand) {
          var bData = brandRegionData[brand];
          var regions = bData.regions || {};
          var regionList = Object.keys(regions).sort();

          if (regionList.length === 0) {
            exportData.push([brand, bData.code || '', '', '', '', '']);
          } else {
            regionList.forEach(function(region) {
              var rData = regions[region];
              var subRegions = rData.subRegions || [];

              if (subRegions.length === 0) {
                exportData.push([brand, bData.code || '', region, rData.code || '', '', '']);
              } else {
                subRegions.forEach(function(subRegion) {
                  exportData.push([brand, bData.code || '', region, rData.code || '', getRegionSubRegionName(subRegion), '']);
                });
              }
            });
          }
        });

        var ws = XLSX.utils.aoa_to_sheet(exportData);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '品牌区域');

        ws['!cols'] = [
          { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 10 }
        ];

        XLSX.writeFile(wb, fileName);
        showToast('导出成功，共 ' + (exportData.length - 1) + ' 条数据', 'success');
      }
    });
  }

  // 线索列表过滤
  function clearClueFilter() {
    var pageLeads = document.getElementById('page-leads');
    if (!pageLeads) return;
    var searchInput = pageLeads.querySelector('.search-input');
    var selects = pageLeads.querySelectorAll('.filter-select');
    if (searchInput) searchInput.value = '';
    selects.forEach(function(sel) { sel.value = ''; });
    filterClueList();
    // 重置Tab到全部
    document.querySelectorAll('#page-leads .tabs .tab-btn').forEach(function(b) { b.classList.remove('active'); });
    var firstTab = document.querySelector('#page-leads .tabs .tab-btn');
    if (firstTab) firstTab.classList.add('active');
    var tbody = document.getElementById('clue-tbody');
    if (tbody) tbody.querySelectorAll('tr').forEach(function(r) { r.style.display = ''; });
    var infoEl = document.querySelector('#page-leads .pagination-info');
    if (infoEl) infoEl.textContent = '共 6 条数据';
  }

  function filterClueList() {
    var pageLeads = document.getElementById('page-leads');
    if (!pageLeads) return;
    
    var searchInput = pageLeads.querySelector('.search-input');
    var selects = pageLeads.querySelectorAll('.filter-select');
    
    var searchKeyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var statusFilter = selects[0] ? selects[0].value : '';
    var levelFilter = selects[1] ? selects[1].value : '';
    var channelFilter = selects[2] ? selects[2].value : '';
    var brandFilter = selects[3] ? selects[3].value : '';
    var vehicleFilter = selects[4] ? selects[4].value : '';
    
    var tbody = document.getElementById('clue-tbody');
    if (!tbody) return;
    
    var rows = tbody.querySelectorAll('tr');
    var visibleCount = 0;
    
    rows.forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length < 10) {
        row.style.display = '';
        visibleCount++;
        return;
      }
      
      var clueCode = cells[0].textContent.toLowerCase();
      var customerInfo = cells[1].textContent.toLowerCase();
      var brand = cells[2].textContent.trim();
      var vehicle = cells[3].textContent.trim();
      var level = cells[4].textContent.trim();
      var channel = cells[5].textContent.trim();
      var statusBadge = cells[7].querySelector('.status-badge');
      var status = statusBadge ? statusBadge.textContent.trim() : cells[7].textContent.trim();
      
      // 状态映射
      var statusMap = {'待处理':'1', '处理中':'2', '已下发':'3', '下发失败':'4', '仅接收':'5'};
      // 等级映射
      var levelMap = {'A级(高意向)':'A', 'B级(中意向)':'B', 'C级(低意向)':'C', 'D级(无意向)':'D'};
      
      var searchMatch = searchKeyword === '' || clueCode.indexOf(searchKeyword) > -1 || customerInfo.indexOf(searchKeyword) > -1;
      var statusMatch = statusFilter === '' || statusMap[status] === statusFilter;
      var levelValue = levelMap[levelFilter] || '';
      var levelMatch = levelFilter === '' || level === levelValue;
      var channelMatch = channelFilter === '' || channel === channelFilter;
      var brandMatch = brandFilter === '' || brand === brandFilter;
      var vehicleMatch = vehicleFilter === '' || vehicle === vehicleFilter;
      
      if (searchMatch && statusMatch && levelMatch && channelMatch && brandMatch && vehicleMatch) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });
    
    // 更新分页信息
    var paginationInfo = pageLeads.querySelector('.pagination-info');
    if (paginationInfo) {
      paginationInfo.textContent = '共 ' + visibleCount + ' 条数据';
    }
  }

  // 导出线索数据（异步）
  function exportClueData() {
    var timestamp = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
    var fileName = '线索数据_' + timestamp + '.xlsx';

    // 读取列可见性设置
    var colState = null;
    try { colState = JSON.parse(localStorage.getItem('leadColumnSettings')); } catch(e) {}
    var visible = colState && colState.visible ? colState.visible : _leadColumnDefs.map(function() { return true; });

    doAsyncExport({
      title: '正在导出线索数据...',
      description: '正在整理客户线索信息',
      fileName: fileName,
      steps: [
        { percent: 20, status: '正在收集线索数据...', delay: 400 },
        { percent: 50, status: '正在整理客户信息...', delay: 500 },
        { percent: 80, status: '正在处理导出格式...', delay: 400 },
        { percent: 95, status: '即将完成...', delay: 200 }
      ],
      download: function() {
        var exportData = [];
        // 构建表头（只包含可见列，客户信息拆为姓名+电话号码）
        var headers = [];
        if (visible[0]) headers.push('线索编号');
        if (visible[1]) { headers.push('客户姓名'); headers.push('电话号码'); }
        if (visible[2]) headers.push('意向品牌');
        if (visible[3]) headers.push('意向车系');
        if (visible[4]) headers.push('意向等级');
        if (visible[5]) headers.push('API Key');
        if (visible[6]) headers.push('意向门店');
        if (visible[7]) headers.push('线索状态');
        if (visible[8]) headers.push('接收时间');
        exportData.push(headers);

        var tbody = document.getElementById('clue-tbody');
        if (tbody) {
          var rows = tbody.querySelectorAll('tr');
          rows.forEach(function(row) {
            var cells = row.querySelectorAll('td');
            if (cells.length < 10) return;
            if (row.style.display === 'none') return;

            var customerCell = cells[1];
            var customerName = customerCell.querySelector('strong') ? customerCell.querySelector('strong').textContent.trim() : customerCell.textContent.split('\n')[0].trim();
            var phoneDiv = customerCell.querySelector('div:last-child');
            var phone = phoneDiv ? phoneDiv.textContent.trim() : '';
            var statusBadge = cells[7].querySelector('.status-badge');
            var statusText = statusBadge ? statusBadge.textContent.trim() : cells[7].textContent.trim().replace('● ', '');

            // 收集所有列的原始数据
            var rawData = [
              cells[0].textContent.trim(),         // 0: 线索编号
              customerName,                         // 1a: 客户姓名
              phone,                                // 1b: 电话号码
              cells[2].textContent.trim(),          // 2: 意向品牌
              cells[3].textContent.trim(),          // 3: 意向车系
              cells[4].textContent.trim(),          // 4: 意向等级
              cells[5].textContent.trim(),          // 5: API Key
              cells[6].textContent.trim(),          // 6: 意向门店
              statusText,                           // 7: 线索状态
              cells[8].textContent.trim()           // 8: 接收时间
            ];

            // 按可见列筛选
            var rowData = [];
            if (visible[0]) rowData.push(rawData[0]);
            if (visible[1]) { rowData.push(rawData[1]); rowData.push(rawData[2]); }
            if (visible[2]) rowData.push(rawData[3]);
            if (visible[3]) rowData.push(rawData[4]);
            if (visible[4]) rowData.push(rawData[5]);
            if (visible[5]) rowData.push(rawData[6]);
            if (visible[6]) rowData.push(rawData[7]);
            if (visible[7]) rowData.push(rawData[8]);
            if (visible[8]) rowData.push(rawData[9]);
            exportData.push(rowData);
          });
        }

        // 如果没有数据，添加示例数据
        if (exportData.length === 1) {
          var sampleRow = [];
          if (visible[0]) { sampleRow.push('LD2026051400001'); sampleRow.push('LD2026051400002'); }
          // 示例数据始终至少包含基本信息
          if (exportData[0].length === 0) {
            exportData[0] = ['线索编号', '客户姓名', '电话号码', '意向品牌', '意向车系', '意向等级', 'API Key', '意向门店', '线索状态', '接收时间'];
            exportData.push(['LD2026051400001', '李明', '138****8888', '理想汽车', '理想L9', 'A', '懂车帝', '深圳理想南山店', '待处理', '2025-05-14 09:30']);
            exportData.push(['LD2026051400002', '王芳', '139****9999', '问界', '问界M9', 'B', '汽车之家', '深圳问界福田店', '处理中', '2025-05-14 09:15']);
            exportData.push(['LD2026051400003', '张伟', '137****7777', '小鹏汽车', '小鹏G9', 'A', '易车', '广州小鹏天河店', '已下发', '2025-05-14 08:45']);
            exportData.push(['LD2026050128', '刘强', '135****5555', '理想汽车', '理想L8', 'C', '懂车帝', '深圳理想南山店', '下发失败', '2025-05-13 16:20']);
            exportData.push(['LD2026051400004', '陈敏', '136****0000', '东风日产', '天籁', 'B', '懂车帝', '上海东风日产浦东店', '仅接收', '2026-05-14 10:12']);
            exportData.push(['LD2026051400005', '赵强', '188****2222', '理想汽车', '理想L9', 'A', '汽车之家', '深圳理想南山店', '仅接收', '2026-05-14 10:18']);
          }
        }

        var ws = XLSX.utils.aoa_to_sheet(exportData);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '线索数据');

        // 动态列宽
        var colWidths = [];
        var headerRow = exportData[0];
        for (var i = 0; i < headerRow.length; i++) {
          var h = headerRow[i];
          if (h.length <= 3) colWidths.push({ wch: 10 });
          else if (h.length <= 6) colWidths.push({ wch: 15 });
          else colWidths.push({ wch: 18 });
        }
        ws['!cols'] = colWidths;

        XLSX.writeFile(wb, fileName);
        showToast('导出成功，共 ' + (exportData.length - 1) + ' 条数据', 'success');
      }
    });
  }

  // ========== 列设置功能 ==========
  // 列定义：索引 → { key, label, required }
  var _leadColumnDefs = [
    { key: 'code',     label: '线索编号', required: true  },
    { key: 'customer', label: '客户信息', required: true  },
    { key: 'brand',    label: '意向品牌', required: false },
    { key: 'vehicle',  label: '意向车系', required: false },
    { key: 'level',    label: '意向等级', required: false },
    { key: 'apikey',   label: 'API Key',  required: false },
    { key: 'store',    label: '意向门店', required: false },
    { key: 'status',   label: '线索状态', required: true  },
    { key: 'time',     label: '接收时间', required: false },
    { key: 'action',   label: '操作',     required: true  }
  ];

  // 初始化列设置（页面加载时调用）
  function initColumnSettings() {
    // 从 localStorage 读取
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('leadColumnSettings')); } catch(e) {}
    if (!saved || !saved.visible || saved.visible.length !== _leadColumnDefs.length) {
      // 首次或格式不对：全部可见
      saved = { visible: _leadColumnDefs.map(function(_, i) { return true; }) };
    }
    // 确保必选列始终可见
    _leadColumnDefs.forEach(function(def, i) {
      if (def.required && !saved.visible[i]) saved.visible[i] = true;
    });
    // 回写 localStorage
    try { localStorage.setItem('leadColumnSettings', JSON.stringify(saved)); } catch(e) {}
    // 同步 checkbox 状态
    syncColumnCheckboxes(saved);
    // 应用隐藏样式
    applyColumnStyle(saved);
  }

  // 同步下拉面板中的 checkbox 状态
  function syncColumnCheckboxes(state) {
    var dropdown = document.getElementById('columnSettingsDropdown');
    if (!dropdown) return;
    var checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
    for (var i = 0; i < checkboxes.length && i < state.visible.length; i++) {
      checkboxes[i].checked = state.visible[i];
    }
  }

  // 应用列可见性样式（动态 <style> 注入）
  function applyColumnStyle(state) {
    if (!state) {
      try { state = JSON.parse(localStorage.getItem('leadColumnSettings')); } catch(e) {}
    }
    if (!state || !state.visible) return;

    var styleId = 'lead-column-style';
    var styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    var css = '';
    for (var i = 0; i < state.visible.length; i++) {
      if (!state.visible[i]) {
        var n = i + 1;
        css += '#page-leads th:nth-child(' + n + '),#page-leads td:nth-child(' + n + '){display:none;}\n';
      }
    }
    styleEl.textContent = css;
  }

  // 开关列设置下拉面板
  function toggleColumnSettings() {
    var dropdown = document.getElementById('columnSettingsDropdown');
    if (!dropdown) return;
    var isOpen = dropdown.classList.contains('show');
    if (isOpen) {
      dropdown.classList.remove('show');
    } else {
      // 先同步 checkbox 状态
      var saved = null;
      try { saved = JSON.parse(localStorage.getItem('leadColumnSettings')); } catch(e) {}
      if (saved) syncColumnCheckboxes(saved);
      dropdown.classList.add('show');
    }
  }

  // 列 checkbox 变化时：保存 + 应用
  function applyColumnVisibility() {
    var dropdown = document.getElementById('columnSettingsDropdown');
    if (!dropdown) return;
    var checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
    var visible = [];
    for (var i = 0; i < checkboxes.length; i++) {
      visible.push(checkboxes[i].checked);
    }
    // 确保必选列
    _leadColumnDefs.forEach(function(def, i) {
      if (def.required && !visible[i]) visible[i] = true;
    });
    var state = { visible: visible };
    try { localStorage.setItem('leadColumnSettings', JSON.stringify(state)); } catch(e) {}
    syncColumnCheckboxes(state);
    applyColumnStyle(state);
  }

  // 点击外部关闭下拉
  document.addEventListener('click', function(e) {
    var dropdown = document.getElementById('columnSettingsDropdown');
    if (!dropdown || !dropdown.classList.contains('show')) return;
    var container = dropdown.parentElement;
    if (container && !container.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });

  // 导出门店数据（异步）
  function exportStoreData() {
    var timestamp = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
    var fileName = '门店数据_' + timestamp + '.xlsx';

    doAsyncExport({
      title: '正在导出门店数据...',
      description: '正在整理经销商门店信息',
      fileName: fileName,
      steps: [
        { percent: 20, status: '正在收集门店数据...', delay: 400 },
        { percent: 50, status: '正在整理门店信息...', delay: 500 },
        { percent: 80, status: '正在处理关联数据...', delay: 400 },
        { percent: 95, status: '即将完成...', delay: 200 }
      ],
      download: function() {
        var exportData = [];
        exportData.push(['经销商名称', '经销商编码', '所属品牌', '所属城市', '类型', '售后电话', '邮箱', '详细地址', '状态', '关联车系']);

        var storeList = [
          { name: '深圳理想南山店', code: 'LIXIANG_SZ_NS_001', brand: '理想汽车', city: '深圳市南山区', type: '一网店', tel: '0755-86521234', email: 'nanshan@lixiang.com', address: '科苑南路XX号', status: '启用', carSeries: '理想L9、理想L8' },
          { name: '深圳问界福田店', code: 'AITO_SZ_FT_001', brand: '问界', city: '深圳市福田区', type: '一网店', tel: '0755-82952100', email: 'futian@aito.com', address: '车公庙XX路XX号', status: '启用', carSeries: '问界M9、问界M7' },
          { name: '广州小鹏天河店', code: 'XIAOPENG_GZ_TH_001', brand: '小鹏汽车', city: '广州市天河区', type: '二网店', tel: '020-88881234', email: 'tianhe@xiaopeng.com', address: '珠江新城XX路XX号', status: '启用', carSeries: '小鹏G9、小鹏G6、小鹏P7' },
          { name: '广州东风日产专营店', code: 'DFN_GZ_TH_001', brand: '东风日产', city: '广州市天河区', type: '一网店', tel: '020-38861234', email: 'gz_tianhe@dongfeng-nissan.com', address: '天河路385号太古汇一座', status: '启用', carSeries: '轩逸、天籁' },
          { name: '深圳东风日产龙岗店', code: 'DFN_SZ_LG_001', brand: '东风日产', city: '深圳市龙岗区', type: '一网店', tel: '0755-28951234', email: 'sz_longgang@dongfeng-nissan.com', address: '龙翔大道7188号万科广场', status: '启用', carSeries: '轩逸、逍客' },
          { name: '上海东风日产浦东店', code: 'DFN_SH_PD_001', brand: '东风日产', city: '上海市浦东新区', type: '一网店', tel: '021-50881234', email: 'sh_pudong@dongfeng-nissan.com', address: '世纪大道100号环球金融中心', status: '启用', carSeries: '天籁、新楼兰' },
          { name: '佛山东风日产禅城店', code: 'DFN_FS_CC_001', brand: '东风日产', city: '佛山市禅城区', type: '二网店', tel: '0757-83121234', email: 'fs_chancheng@dongfeng-nissan.com', address: '季华五路28号万科金融中心', status: '启用', carSeries: '轩逸、逍客、新楼兰' },
          { name: '苏州东风日产吴中店', code: 'DFN_SU_WZ_001', brand: '东风日产', city: '苏州市吴中区', type: '二网店', tel: '0512-65121234', email: 'su_wuzhong@dongfeng-nissan.com', address: '苏雅路308号信投大厦', status: '启用', carSeries: '轩逸、天籁、逍客' },
          { name: '杭州东风日产西湖店', code: 'DFN_HZ_XH_001', brand: '东风日产', city: '杭州市西湖区', type: '一网店', tel: '0571-87981234', email: 'hz_xihu@dongfeng-nissan.com', address: '天目山路218号第一世界广场', status: '启用', carSeries: '天籁、逍客、新楼兰' }
        ];

        storeList.forEach(function(item) {
          exportData.push([
            item.name, item.code, item.brand, item.city, item.type,
            item.tel, item.email, item.address, item.status, item.carSeries
          ]);
        });

        var ws = XLSX.utils.aoa_to_sheet(exportData);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '门店数据');

        ws['!cols'] = [
          { wch: 18 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 8 },
          { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 8 }, { wch: 25 }
        ];

        XLSX.writeFile(wb, fileName);
        showToast('导出成功，共 ' + storeList.length + ' 条数据', 'success');
      }
    });
  }

  // ========== 门店管理导入/导出 ==========
  var storeImportCurrentStep = 1;
  var storeImportWorkbook = null;
  var storeImportData = [];

  // 打开门店导入弹窗
  function openStoreImportModal() {
    resetStoreImportModal();
    openModal('storeImportModal');
  }

  // 关闭门店导入弹窗
  function closeStoreImportModal() {
    closeModal('storeImportModal');
  }

  // 重置门店导入弹窗
  function resetStoreImportModal() {
    storeImportCurrentStep = 1;
    storeImportWorkbook = null;
    storeImportData = [];

    // 重置步骤指示器
    document.getElementById('storeImportStep1').className = 'import-step active';
    document.getElementById('storeImportStep2').className = 'import-step';
    document.getElementById('storeImportStep3').className = 'import-step';
    document.getElementById('storeImportLine1').style.background = 'var(--gray-200)';
    document.getElementById('storeImportLine2').style.background = 'var(--gray-200)';

    // 显示/隐藏步骤内容
    document.getElementById('storeImportStepContent1').style.display = 'block';
    document.getElementById('storeImportStepContent2').style.display = 'none';
    document.getElementById('storeImportStepContent3').style.display = 'none';

    // 重置按钮
    document.getElementById('storeImportNextBtn').textContent = '下一步';
    document.getElementById('storeImportNextBtn').disabled = true;
    document.getElementById('storeImportModalFooter').style.display = 'flex';

    // 重置文件
    resetStoreImportFile();
  }

  // 处理门店导入文件
  function handleStoreImportFile(input) {
    var file = input.files[0];
    if (!file) return;

    var ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      showToast('请上传 Excel 或 CSV 文件', 'error');
      return;
    }

    // 显示文件信息
    document.getElementById('storeSelectedFileName').textContent = file.name;
    document.getElementById('storeSelectedFileSize').textContent = formatFileSize(file.size);
    document.getElementById('storeSelectedFileInfo').style.display = 'flex';

    // 读取文件
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = new Uint8Array(e.target.result);
        storeImportWorkbook = XLSX.read(data, { type: 'array', cellDates: true });
        document.getElementById('storeImportNextBtn').disabled = false;
        showToast('文件读取成功，请点击下一步预览数据', 'success');
      } catch (err) {
        showToast('文件读取失败：' + err.message, 'error');
        resetStoreImportFile();
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // 重置门店导入文件
  function resetStoreImportFile() {
    document.getElementById('storeImportFile').value = '';
    document.getElementById('storeSelectedFileInfo').style.display = 'none';
    document.getElementById('storeImportNextBtn').disabled = true;
    storeImportWorkbook = null;
    storeImportData = [];
  }

  // 下载门店导入模板
  function downloadStoreTemplate() {
    var templateData = [
      ['经销商名称', '经销商编码', '所属品牌', '所属城市', '类型', '售后电话', '邮箱', '详细地址'],
      ['深圳理想南山店', 'LIXIANG_SZ_NS_001', '理想汽车', '深圳市南山区', '一网店', '0755-86521234', 'test@example.com', '科苑南路XX号'],
      ['深圳问界福田店', 'AITO_SZ_FT_001', '问界', '深圳市福田区', '一网店', '0755-82952100', 'test@example.com', '车公庙XX路XX号'],
    ];

    var ws = XLSX.utils.aoa_to_sheet(templateData);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '门店数据');

    ws['!cols'] = [
      { wch: 18 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 8 },
      { wch: 15 }, { wch: 20 }, { wch: 20 }
    ];

    XLSX.writeFile(wb, '门店数据导入模板.xlsx');
    showToast('模板下载成功', 'success');
  }

  // 门店导入下一步
  function goStoreImportNextStep() {
    if (storeImportCurrentStep === 1) {
      // 步骤1 → 步骤2：解析数据并预览
      if (!storeImportWorkbook) {
        showToast('请先上传文件', 'error');
        return;
      }

      var sheetName = storeImportWorkbook.SheetNames[0];
      var sheet = storeImportWorkbook.Sheets[sheetName];
      storeImportData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // 生成预览表格
      var thead = document.getElementById('storeImportTableHead');
      var tbody = document.getElementById('storeImportTableBody');
      thead.innerHTML = '';
      tbody.innerHTML = '';

      if (storeImportData.length > 0) {
        var headers = storeImportData[0];
        headers.forEach(function(h) {
          var th = document.createElement('th');
          th.textContent = h || '';
          th.style.padding = '10px 12px';
          th.style.textAlign = 'left';
          th.style.borderBottom = '1px solid var(--gray-200)';
          th.style.fontWeight = '500';
          thead.appendChild(th);
        });

        var previewCount = Math.min(storeImportData.length - 1, 5);
        for (var i = 1; i <= previewCount; i++) {
          if (storeImportData[i] && storeImportData[i].length > 0) {
            var tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--gray-100)';
            storeImportData[i].forEach(function(cell) {
              var td = document.createElement('td');
              td.textContent = cell || '';
              td.style.padding = '10px 12px';
              tr.appendChild(td);
            });
            tbody.appendChild(tr);
          }
        }

        document.getElementById('storeImportDataCount').textContent = storeImportData.length - 1;
      }

      // 更新步骤
      storeImportCurrentStep = 2;
      document.getElementById('storeImportStep1').className = 'import-step';
      document.getElementById('storeImportStep2').className = 'import-step active';
      document.getElementById('storeImportLine1').style.background = 'var(--primary)';
      document.getElementById('storeImportStepContent1').style.display = 'none';
      document.getElementById('storeImportStepContent2').style.display = 'block';
      document.getElementById('storeImportNextBtn').textContent = '确认导入';

    } else if (storeImportCurrentStep === 2) {
      // 步骤2 → 步骤3：执行导入
      var importCount = storeImportData.length - 1;
      document.getElementById('storeImportCompleteInfo').textContent = '共成功导入 ' + importCount + ' 条门店数据';

      // 更新步骤
      storeImportCurrentStep = 3;
      document.getElementById('storeImportStep2').className = 'import-step';
      document.getElementById('storeImportStep3').className = 'import-step active';
      document.getElementById('storeImportLine2').style.background = 'var(--primary)';
      document.getElementById('storeImportStepContent2').style.display = 'none';
      document.getElementById('storeImportStepContent3').style.display = 'block';
      document.getElementById('storeImportNextBtn').textContent = '完成';
      document.getElementById('storeImportNextBtn').disabled = false;
      document.getElementById('storeImportModalFooter').style.display = 'none';

    } else if (storeImportCurrentStep === 3) {
      // 步骤3 → 关闭
      closeStoreImportModal();
      showToast('导入完成，共导入 ' + (storeImportData.length - 1) + ' 条数据', 'success');
    }
  }

  // 删除区域节点
  function deleteRegionNode(type, name, brand, region) {
    if (!confirm('确定要删除"' + name + '"吗？')) return;
    
    if (type === 'brand') {
      delete brandRegionData[name];
      showToast('删除成功', 'success');
    } else if (type === 'region') {
      var bData = brandRegionData[brand];
      if (bData && bData.regions) {
        delete bData.regions[name];
        showToast('删除成功', 'success');
      }
    } else if (type === 'subregion') {
      var brData = brandRegionData[brand];
      if (brData && brData.regions && brData.regions[region]) {
        var idx = findRegionSubRegionIndex(brData.regions[region].subRegions, name);
        if (idx !== -1) {
          brData.regions[region].subRegions.splice(idx, 1);
          showToast('删除成功', 'success');
        }
      }
    }
    
    renderRegionTree();
    // 清空详情面板
    document.getElementById('regionDetailPanel').innerHTML = '<div style="text-align: center; color: var(--gray-400); padding: 60px 0;"><div style="font-size: 48px; margin-bottom: 16px;">🏢</div><p>请从左侧选择品牌/大区/小区查看详情</p></div>';
  }

  // 展开全部
  function expandAllRegionTree() {
    var items = document.querySelectorAll('#regionTreeContainer .tree-toggle');
    items.forEach(function(toggle) {
      if (!toggle.classList.contains('empty')) {
        toggle.classList.add('expanded');
        var children = toggle.parentElement.nextElementSibling;
        if (children && children.classList.contains('tree-children')) {
          children.classList.add('expanded');
        }
      }
    });
  }

  // 收起全部
  function collapseAllRegionTree() {
    var items = document.querySelectorAll('#regionTreeContainer .tree-toggle');
    items.forEach(function(toggle) {
      toggle.classList.remove('expanded');
      var children = toggle.parentElement.nextElementSibling;
      if (children && children.classList.contains('tree-children')) {
        children.classList.remove('expanded');
      }
    });
  }

  // 搜索过滤
  function filterRegionTree(keyword) {
    var items = document.querySelectorAll('#regionTreeContainer .tree-item');
    keyword = keyword.toLowerCase();
    
    items.forEach(function(item) {
      var name = item.dataset.name || '';
      if (!keyword || name.toLowerCase().includes(keyword)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  // 初始化品牌区域树
  function initRegionTree() {
    renderRegionTree();
  }

  // 省份变更时，更新城市下拉框
  function onProvinceChange(province) {
    var citySelect = document.getElementById('citySelect');
    var cityDistrictSelect = document.getElementById('cityDistrictSelect');
    var cityDistricts = document.getElementById('cityDistricts');
    
    // 清空城市和区县
    citySelect.innerHTML = '<option value="">请选择城市</option>';
    cityDistrictSelect.innerHTML = '<option value="">请先选择城市</option>';
    cityDistricts.value = '';
    
    if (!province) {
      citySelect.disabled = true;
      cityDistrictSelect.disabled = true;
      return;
    }
    
    // 填充城市列表
    var cities = cityTreeData[province]?.cities || {};
    for (var city in cities) {
      var option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    }
    citySelect.disabled = false;
    cityDistrictSelect.disabled = true;
  }

  // 城市变更时，更新区县下拉框
  function onCityChange(city) {
    var cityDistrictSelect = document.getElementById('cityDistrictSelect');
    var cityDistricts = document.getElementById('cityDistricts');
    var province = document.getElementById('cityProvince').value;
    
    // 清空区县
    cityDistrictSelect.innerHTML = '<option value="">请选择区县（可多选）</option>';
    cityDistricts.value = '';
    
    if (!city) {
      cityDistrictSelect.disabled = true;
      return;
    }
    
    // 填充区县列表
    var districts = cityTreeData[province]?.cities[city]?.districts || [];
    districts.forEach(function(d) {
      var option = document.createElement('option');
      option.value = d;
      option.textContent = d;
      cityDistrictSelect.appendChild(option);
    });
    cityDistrictSelect.disabled = false;
  }

  // 区县变更时，更新已选区县文本
  function onDistrictChange() {
    var cityDistrictSelect = document.getElementById('cityDistrictSelect');
    var cityDistricts = document.getElementById('cityDistricts');
    var selected = Array.from(cityDistrictSelect.selectedOptions)
                        .map(function(opt) { return opt.value; })
                        .filter(function(v) { return v; });
    cityDistricts.value = selected.join('、');
  }

  // 城市管理弹窗
  function openCityModal(province, name, code, districts) {
    document.getElementById('cityModalTitle').textContent = name ? '编辑城市' : '新增城市';
    document.getElementById('cityCode').value = code || '';
    document.getElementById('cityDistrictSelect').innerHTML = '<option value="">请先选择城市</option>';
    document.getElementById('cityDistrictSelect').disabled = true;
    document.getElementById('cityDistricts').value = '';
    document.getElementById('cityStatus').value = '1';
    
    // 动态填充省份列表
    var provinceSelect = document.getElementById('cityProvince');
    provinceSelect.innerHTML = '<option value="">请选择省份</option>';
    var provinces = Object.keys(cityTreeData).sort();
    provinces.forEach(function(p) {
      var option = document.createElement('option');
      option.value = p;
      option.textContent = p;
      provinceSelect.appendChild(option);
    });
    
    // 设置省份并触发城市列表加载
    if (province && cityTreeData[province]) {
      provinceSelect.value = province;
      // 延迟设置城市和区县，确保下拉框已填充
      setTimeout(function() {
        onProvinceChange(province);
        // 再延迟设置城市
        setTimeout(function() {
          var citySelect = document.getElementById('citySelect');
          if (name && cityTreeData[province]?.cities[name]) {
            citySelect.value = name;
            citySelect.disabled = false;
            // 触发城市变更，加载区县
            setTimeout(function() {
              onCityChange(name);
              // 设置区县
              var cityDistrictSelect = document.getElementById('cityDistrictSelect');
              if (districts) {
                var districtList = districts.split('、');
                var options = cityDistrictSelect.options;
                for (var i = 0; i < options.length; i++) {
                  if (districtList.indexOf(options[i].value) !== -1) {
                    options[i].selected = true;
                  }
                }
                document.getElementById('cityDistricts').value = districts;
              }
            }, 50);
          } else {
            // 非标准城市，直接填入输入框
            document.getElementById('citySelect').innerHTML = '<option value="">请选择城市</option>';
            document.getElementById('cityName').value = name || '';
          }
        }, 50);
      }, 50);
    } else {
      provinceSelect.value = '';
      document.getElementById('citySelect').innerHTML = '<option value="">请先选择省份</option>';
      document.getElementById('citySelect').disabled = true;
      document.getElementById('cityName').value = '';
    }
    
    openModal('cityModal');
  }
  
  function saveCityData() {
    var province = document.getElementById('cityProvince').value;
    var citySelect = document.getElementById('citySelect');
    var cityInput = document.getElementById('cityName').value.trim();
    var code = document.getElementById('cityCode').value.trim();
    var districts = document.getElementById('cityDistricts').value.trim();
    
    if (!province) {
      showToast('请选择所属省份', 'error');
      return;
    }
    if (!citySelect.value && !cityInput) {
      showToast('请选择或输入城市名称', 'error');
      return;
    }
    if (!code) {
      showToast('请输入城市编码', 'error');
      return;
    }
    
    closeModal('cityModal');
    showToast('城市保存成功', 'success');
  }

  