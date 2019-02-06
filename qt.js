function servisebi(i, o) {
  o('avia biletebi', function saidan(i, o) {
    o('tbilisi', function sad(i, o) {
      var cnobari = {
        Tbilisi: { Descr: 'Tbilisi', IATA: 'TBS', ...{} },
        TBS: { Descr: 'Tbilisi', IATA: 'TBS', ...{} },
        თბილისი: { Descr: 'Tbilisi', IATA: 'TBS', ...{} }
      }
      o(
        S.map(function(text) {
          if (cnobari[text] == null) {
            return function verGaige(i, o) {
              //
              o('ver gavige cade akhlidan', sad)
            }
          } else {
            return function oneWay(i, o) {
              o('one way', function one(i, o) {
                o('seikvanet gamgzavrebis tarigi (dge/tve/weli)')
                o(
                  i
                    .filter(t => t.trim() == '')
                    .map(function(text) {
                      var list = text.split(/\/| |,|\.|;/).filter(s => s != '')
                      if (list.length == 1) {
                        return function arasworiTarigi(i, o) {
                          o('araswori tarigi')
                          one(i, o)
                        }
                      } else if (list.length == 2) {
                        return function wlisGareshe(i, o) {
                          var cnobtve = {
                            '06': 'ivnisi',
                            '6': 'ivnisi',
                            ivnisi: 'ivnisi',
                            ivn: 'ivnisi'
                          }
                          var isDay = function(t) {
                            var n = parseInt(t, 10)
                            if (isNaN(n)) {
                              return false
                            } else if (1 <= n && n <= 31) {
                              return true
                            } else {
                              return false
                            }
                          }
                          var [t1, t2] = list
                          var weli = new Date().getFullYear()

                          o('araswori tarigi')
                          one(i, o)
                        }
                      }
                    })
                )
              })
              o('two way')
            }
          }
        }, i)
      )
    })
    o('kutaisi')
    o('batumi')
  })
  o('sastumro')
  o('dazgveva')
}
