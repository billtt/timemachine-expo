import {useEffect, useState} from "react";
import {SafeAreaView, FlatList, StyleSheet, Text, View, RefreshControl, ActivityIndicator, Animated, Alert, StatusBar} from 'react-native';
import { Button } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {RectButton} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';

import ReadMore from 'react-native-read-more-text';
import ListSwipe from './ListSwipe';
import EditModal from './EditModal';
import LoginModal from './LoginModal';
import Utils from './Utils';

const _global = {
  token: '',
};

export default function App() {
  const [refreshing, setRefreshing] = useState(false);
  const [listData, setListData] = useState([]);
  const [date, setDate] = useState(new Date());
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync(Ionicons.font).then(() => setFontsLoaded(true));
  }, []);

  const changeDate = (dayOffset:number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + dayOffset);
    setDate(newDate);
  };

  const login = async (username:string, password:string) => {
    setLoginModalVisible(false);
    let json = await Utils.fetchJson('/api/login', null, {username: username, password: password});
    if (!json || json.code !== 0) {
      if (json) {
        console.log('Login error: ' + json.code);
      }
      setLoginModalVisible(true);
    } else {
        try {
            await AsyncStorage.setItem('TOKEN', json.token);
            _global.token = json.token;
            loadList();
        } catch (error) {
          console.log(error);
            setLoginModalVisible(true);
        }
    }
  };

  const logout = async () => {
      try {
          await AsyncStorage.removeItem('TOKEN');
          _global.token = null;
          if (searchMode) {
              setSearchMode(false);
              setSearchText('');
          }
          setListData([]);
      } catch (error) {
          console.log(error);
      }
      setLoginModalVisible(true);
  };

  const onLogoutPress = () => {
      const ok = window.confirm('Sure to logout?');
      if (ok) {
        logout();
      }
  };

  const loadList = async()=> {
    if (_global.token === '') {
        return;
    }
    setListData([]);
    setRefreshing(true);
    let json = await Utils.fetchJson('/api/list', _global.token, {date: date.toDateString()});
    if (!json || json.code !== 0) {
      if (json) {
        console.log('List error: ' + json.code);
      }
      setRefreshing(false);
    } else {
      setListData(json.slices);
      setRefreshing(false);
    }
  };

  const addSlice = async(content:string, addDate:Date) => {
    if (content.trim() === '') {
        return;
    }
      if (_global.token === '') {
          return;
      }
    let json = await Utils.fetchJson('/api/add', _global.token, {content: content, date: addDate.toISOString()});
    if (!json || json.code !== 0) {
      if (json) {
        console.log('Add error: ' + json.code);
      }
    } else {
      if (addDate.toDateString() === date.toDateString()) {
        loadList();
      } else {
        setDate(addDate);
      }
    }
  };

  const search = async() => {
    if (_global.token === '') {
        return;
    }
    if (searchText.trim() === '') {
        if (searchMode) {
            setSearchMode(false);
            loadList();
        }
        return;
    }
    setListData([]);
    setRefreshing(true);
    setSearchMode(true);
    let json = await Utils.fetchJson('/api/search', _global.token, {search: searchText});
    if (!json || json.code !== 0) {
      if (json) {
        console.log('Search error: ' + json.code);
      }
      setRefreshing(false);
    } else {
      setListData(json.slices);
      setRefreshing(false);
    }
  };

  const remove = async(id:string) => {
      if (_global.token === '') {
          return;
      }
      let json = await Utils.fetchJson('/api/remove', _global.token, {id: id});
      if (!json || json.code !== 0) {
          if (json) {
              console.log('Delete error: ' + json.code);
          }
      } else {
          let deleted = false;
          for (let i = 0; i < listData.length; i++) {
              if (listData[i].id === id) {
                  listData.splice(i, 1);
                  deleted = true;
                  break;
              }
          }
          if (deleted) {
              setListData([...listData]);
          }
      }
  }

  const update = async(id:string, content:string, date:Date) => {
      if (_global.token === '') {
          return;
      }
      if (content.trim()=== '') {
            return;
      }
        let json = await Utils.fetchJson('/api/update', _global.token, {id: id, content: content, date:date});
        if (!json || json.code !== 0) {
            if (json) {
                console.log('Update error: ' + json.code);
            }
        } else {
            let updated = false;
            for (let i = 0; i < listData.length; i++) {
                if (listData[i].id === id) {
                    listData[i].content = content;
                    listData[i].time = date;
                    updated = true;
                    break;
                }
            }
            if (updated) {
                setListData([...listData]);
            }
        }
  }

  const clearSearch = () => {
      if (searchMode) {
            setSearchMode(false);
            loadList();
      }
  };

  const refresh = () => {
    if (searchMode) {
        search();
    } else {
        loadList();
    }
  };

  const onListItemAction = async (item:Object, action:string)=> {
      if (action === 'copy') {
            Utils.copyToClipboard(item.content);
      }
      if (action === 'delete') {
            if (_global.token === '') {
                return;
            }
            const ok = window.confirm('Sure to delete?');
            if (ok) {
              remove(item.id);
            }
      }
        if (action === 'edit') {
            showEditAsUpdate(item);
        }
  };

  const showEditAsAdd = () => {
      setEditingItem(null);
      setEditModalVisible(true);
  };

  const showEditAsUpdate = (item:Object) => {
        setEditingItem(item);
        setEditModalVisible(true);
  };

  const onEditOK = (editingItem:any, content:string, addDate:Date) => {
      setEditModalVisible(false);
        if (editingItem) {
            update(editingItem.id, content, addDate);
        } else {
            addSlice(content, addDate);
        }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(()=>{
    loadList()
  }, [date]);

    const ListEmptyView = () => {
        return (
            //View to show when list is empty
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    {refreshing ? 'Loading...' :  'No slices found.'}
                </Text>
            </View>
        );
    };

    const ListItemView = ({item, index}) => {
        const date = new Date(item.time);
        return (
            <ListSwipe onActionPress={(action)=>onListItemAction(item, action)}>
                <View style={styles.listItem}>
                    <ReadMore numberOfLines={1}>
                        <Text style={styles.listText}>{item.content}</Text>
                    </ReadMore>
                    <Text style={styles.listTime}>{Utils.simpleDateTime(date)}</Text>
                </View>
            </ListSwipe>
        );
    };

    const ListSeparatorView = () => {
        return (
            //Item Separator
            <View
                style={styles.separator}
            />
        );
    };

  // initilization routine goes here
  const init = async () => {
    try {
      const token = await AsyncStorage.getItem('TOKEN');
      if (token == null) {
        setLoginModalVisible(true);
      } else {
        _global.token = token;
        loadList();
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  return (
      <SafeAreaView style={styles.container}>
          <StatusBar barStyle='dark-content' />
          <View style={styles.titleView}>
              <Text style={styles.titleText}>Time Machine</Text>
              <Button style={styles.logoutButton} icon={{name: "logout", size: 24, color: "gray"}} type='clear' onPress={onLogoutPress}/>
          </View>
          <View style={styles.searchView}>
              <Searchbar placeholder='Search' value={searchText} onChangeText={(text)=>{setSearchText(text)}}
              onSubmitEditing={search} onClear={clearSearch} platform='default'
              style={{backgroundColor: '#f5f5f5'}}/>
          </View>
          <View style={styles.dateView}>
              <Button type='clear' icon={{name: 'arrow-back-ios', size: 16, color: 'gray'}} onPress={()=>changeDate(-1)}></Button>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <input type="date" value={date.toISOString().slice(0, 10)} onChange={(e) => {
                    setDate(new Date(e.target.value));
                  }}/>
                  <Button type='clear' title='Today' onPress={()=>setDate(new Date())} titleStyle={{fontSize: 14, color: 'gray'}}/>
              </View>
              <Button type='clear' icon={{name: 'arrow-forward-ios', size: 16, color: 'gray'}} onPress={()=>changeDate(1)}></Button>
          </View>
          <FlatList
              style={styles.listView}
              data={listData}
              renderItem={ListItemView}
              ItemSeparatorComponent={ListSeparatorView}
              ListEmptyComponent={ListEmptyView}
              refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={refresh} />
              }
          />
          <View style={styles.addButton}>
              <Button
                  icon={{
                      name: "add-circle",
                      size: 36,
                      color: "orange"}}
                  type='clear'
                  titleStyle={{color: 'orange'}}
                  onPress={showEditAsAdd}
              />
          </View>
          <EditModal
              visible={editModalVisible}
              editingItem={editingItem}
              onCancel={()=>setEditModalVisible(false)}
              onOK={onEditOK}
          />
          <LoginModal
              visible={loginModalVisible}
              onOK={login}
          />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  titleView: {
    width: '100%',
      flexDirection: 'row',
        justifyContent: 'space-between',
  },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 60,
    },
    logoutButton: {
      alignSelf: 'flex-end',
        width: 60
    },
  searchView: {
    width: '90%',
    marginTop: 10,
    marginBottom: 10,
  },
  dateView: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 20
  },
  listView: {
    width: '100%',
    marginTop: 10,
    marginBottom: 5,
  },
  listItem: {
    padding: 20,
  },
  listText: {
    marginTop: 3,
    fontSize: 16,
    color: '#555',
  },
  listTime: {
    marginTop: 3,
    fontSize: 14,
    color: '#aaa',
  },
  emptyContainer: {
      paddingTop: 100,
      alignItems: 'center',
  },
  emptyText: {
      fontSize: 15,
      color: 'gray',
  },
  separator: {
    height: 1,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#eee'
  },
  addButton: {
    position: 'absolute',
    bottom: 60,
    right: 25,
  },
    actionText: {
        color: 'white',
        fontSize: 16,
        backgroundColor: 'lightblue',
        padding: 10,
    },
});
