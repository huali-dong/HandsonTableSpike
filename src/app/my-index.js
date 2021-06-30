(function () {
  angular.module('myIndex', [])
    .controller('myIndexController', ['$scope', '$compile', function ($scope, $compile) {
      $scope.addNewRow = addNewRow;
      $scope.save = save;
      $scope.cancel = cancel;
      $scope.data = [];
      $scope.oldData = [];
      $scope.changeItem = [];
      $scope.newItem = [];
      $scope.map = new Map();
      var mockData = Mock.mock('http://local/assignee', {
        'assignee|1-10': [{
          // 属性 id 是一个自增数，起始值为 1，每次增 1
          'assigneeId|+1': 1,
          'assignmentHomeLocation': 'China',
          'assignmentCountry': 'beijing',
          'isManual|1': false,
          'addNew': 'addNew'
        }]
      })

      axios.get('http://local/assignee')
        .then((res) => {
          for (const index in res.data.assignee) {
            var temData = [];
            for (const value in res.data.assignee[index]) {
              temData.push(res.data.assignee[index][value])
            }
            $scope.data.push(temData);
            $scope.oldData = JSON.parse(JSON.stringify($scope.data))
          }


          var example1 = document.getElementById('example1');

          $scope.hot = new Handsontable(example1, {
            data: [],
            allowInsertRow: false,
            readOnly: true,
            colHeaders: ['assigneeId', 'assignmentHomeLocation', 'assignmentHomeCountry', ''],
            columns: [
              {
                editor: false,
                type: "numeric",
              },
              {
                editor: false,
              },
              {
                editor: 'text',
                readOnly: false
              },
              {
                editor: false,
                readOnly: true,
                data: 'del'
              }
            ],
            cells: function (row, column, prop) {
              var cellProperties = {};
              cellProperties.renderer = defaultValueRenderer;
              return cellProperties;
            },
            beforeChangeRender: (changes, source) => {
              if (!changes) return;
            },
            afterChange: (changes, source) => {
              if (!changes) return;
              const row = changes[0][0];

              if($scope.data[row][4] == 'addnew'){
                saveChangeData(row, $scope.newItem)
              }else {
                saveChangeData(row, $scope.changeItem);
              }
            }
          });

          $scope.hot.loadData($scope.data);


        });

      function saveChangeData(row, item) {
        if($scope.data[row][0] == null) return;
        var hasNewData = true;
          for (let i = 0; i < item.length; i++) {
            if (item[i][0] == $scope.data[row][0]) {
              item[i] = [$scope.data[row][0], $scope.data[row][1], $scope.data[row][2], $scope.data[row][3], $scope.data[row][4]];
              hasNewData = false;
              break;
            }
          }
        if(hasNewData) {
          item.push([$scope.data[row][0], $scope.data[row][1], $scope.data[row][2], $scope.data[row][3], $scope.data[row][4]]);
        }
      }

      function isEmptyRow(instance, row) {
        const rowData = instance.getSourceDataAtRow(instance.toPhysicalRow(row));

        for (var i = 0, ilen = rowData.length; i < ilen; i++) {
          if (rowData[i] !== null) {
            return false;
          }
        }

        return true;
      }

      function insertImg(cellProperties, row, col, td) {
        cellProperties.editor = false;
        cellProperties.readOnly = true;
        let imgdel = document.createElement('IMG');
        imgdel.src = '../assets/icon.png';
        imgdel.width = 20;
        imgdel.style = 'cursor:pointer;';
        Handsontable.dom.addEvent(imgdel, 'click', function (event) {
          $scope.hot.alter("remove_row", row);
        });
        td.appendChild(imgdel);
        return td;
      }


      function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
        if (isEmptyRow(instance, row)) {
          cellProperties.readOnly = false;
          cellProperties.editor = 'text';
          if (prop == 'del') {
            if (!td.querySelector('img')) {
              return insertImg(cellProperties, row, col, td);
            }
            return td;
          }
        }

        if ($scope.data[row][4] == 'addnew' && prop == 'del' || ($scope.data[row][3] && prop == 'del')) {

          if (!td.querySelector('img')) {
            return insertImg(cellProperties, row, col, td);
          }

          return td;
        }
        Handsontable.renderers.TextRenderer.apply(this, arguments);
      }

      function addNewRow() {
        $scope.hot.alter('insert_row', 0, 1);
        $scope.data[0][4] = 'addnew';
        $scope.data[0][3] =  true;
      }

      function save() {
        console.log($scope.changeItem, 'change');
        console.log($scope.newItem, 'newItem')
      }

      function cancel(){
        $scope.hot.loadData($scope.oldData);
        $scope.hot.render();
      }


    }]);
})()
