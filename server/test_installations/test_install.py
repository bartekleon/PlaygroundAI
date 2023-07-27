def test_install(func):
  try:
    ret = func()
    
    if ret:
      return ret
    
    return "success"
  except ImportError:
    return "fail"
