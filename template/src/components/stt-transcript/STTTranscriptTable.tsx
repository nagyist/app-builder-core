import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Tooltip from '../../atoms/Tooltip';
import Clipboard from '../../subComponents/Clipboard';
import Spacer from '../../atoms/Spacer';
import {style} from '../recordings/style';
import {TableBody, TableFooter, TableHeader} from '../common/data-table';
import {
  FetchSTTTranscriptResponse,
  useFetchSTTTranscript,
} from './useFetchSTTTranscript';
import {
  capitalizeFirstLetter,
  downloadS3Link,
  getFormattedDateTime,
} from '../../utils/common';
import IconButtonWithToolTip from '../../atoms/IconButton';
import ImageIcon from '../../atoms/ImageIcon';
import Loading from '../../subComponents/Loading';
import GenericPopup from '../common/GenericPopup';
import PlatformWrapper from '../../utils/PlatformWrapper';

const headers = ['Date', 'Time', 'Status', 'Actions'];

interface STTItemRowProps {
  item: FetchSTTTranscriptResponse['stts'][0];
  onDeleteAction: (id: string) => void;
  onDownloadAction: (link: string) => void;
}

function STTItemRow({item, onDeleteAction, onDownloadAction}: STTItemRowProps) {
  const [date, time] = getFormattedDateTime(item.created_at);
  const sttStatus = item.status;

  if (
    sttStatus === 'STOPPING' ||
    sttStatus === 'STARTED' ||
    (sttStatus === 'INPROGRESS' && !item?.download_url)
  ) {
    return (
      <View key={item.id} style={style.pt12}>
        <View style={[style.infotextContainer, style.captionContainer]}>
          <ImageIcon
            iconSize={20}
            iconType="plain"
            name="info"
            tintColor={$config.SEMANTIC_NEUTRAL}
          />
          <Text style={[style.captionText]}>
            Current STT is ongoing. Once the meeting concludes, we'll generate
            the link
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={style.tbrow} key={item.id}>
      <View style={[style.td, style.plzero]}>
        <Text style={style.ttime}>{date}</Text>
      </View>
      <View style={[style.td]}>
        <Text style={style.ttime}>{time}</Text>
      </View>
      <View style={[style.td]}>
        <Text style={style.ttime}>{capitalizeFirstLetter(sttStatus)}</Text>
      </View>
      <View style={style.td}>
        {!item.download_url ? (
          <View style={[style.tactions, {marginTop: 0}]}>
            <Text style={style.placeHolder}>{'No transcripts found'}</Text>
          </View>
        ) : item?.download_url?.length > 0 ? (
          <View style={style.tactions}>
            <View>
              {item?.download_url?.map((link: string, i: number) => (
                <View
                  key={i}
                  style={[
                    style.tactions,
                    //if stts contains multiple parts then we need to add some space each row
                    i >= 1 ? {marginTop: 8} : {},
                  ]}>
                  <View>
                    <IconButtonWithToolTip
                      hoverEffect={true}
                      hoverEffectStyle={style.iconButtonHoverEffect}
                      containerStyle={style.iconButton}
                      iconProps={{
                        name: 'download',
                        iconType: 'plain',
                        iconSize: 20,
                        tintColor: `${$config.SECONDARY_ACTION_COLOR}`,
                      }}
                      onPress={() => {
                        onDownloadAction(link);
                      }}
                    />
                  </View>
                  <View style={[style.pl10]}>
                    <Tooltip
                      isClickable
                      placement="left"
                      toolTipMessage="Link Copied"
                      onPress={() => {
                        Clipboard.setString(link);
                      }}
                      toolTipIcon={
                        <>
                          <ImageIcon
                            iconType="plain"
                            name="tick-fill"
                            tintColor={$config.SEMANTIC_SUCCESS}
                            iconSize={20}
                          />
                          <Spacer size={8} horizontal={true} />
                        </>
                      }
                      fontSize={12}
                      renderContent={() => {
                        return (
                          <PlatformWrapper>
                            {(isHovered: boolean) => (
                              <TouchableOpacity
                                style={[
                                  isHovered ? style.iconButtonHoverEffect : {},
                                  style.iconShareLink,
                                ]}
                                onPress={() => {
                                  Clipboard.setString(link);
                                }}>
                                <ImageIcon
                                  iconType="plain"
                                  name="copy-link"
                                  iconSize={20}
                                  tintColor={$config.SECONDARY_ACTION_COLOR}
                                />
                              </TouchableOpacity>
                            )}
                          </PlatformWrapper>
                        );
                      }}
                    />
                  </View>
                  <View style={[style.pl10]}>
                    <IconButtonWithToolTip
                      hoverEffect={true}
                      hoverEffectStyle={style.iconButtonHoverEffect}
                      containerStyle={style.iconButton}
                      iconProps={{
                        name: 'delete',
                        iconType: 'plain',
                        iconSize: 20,
                        tintColor: `${$config.SEMANTIC_ERROR}`,
                      }}
                      onPress={() => {
                        //show confirmation popup
                        onDeleteAction && onDeleteAction(item.id);
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={(style.tactions, {marginTop: 0})}>
            <Text style={style.placeHolder}>No transcripts found</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function EmptyTranscriptState() {
  return (
    <View style={style.infotextContainer}>
      <View>
        <ImageIcon
          iconType="plain"
          name="info"
          tintColor={'#777777'}
          iconSize={32}
        />
      </View>
      <View>
        <Text style={[style.infoText, style.pt10, style.pl10]}>
          No transcripts found for this meeting
        </Text>
      </View>
    </View>
  );
}

function ErrorTranscriptState(message: any) {
  return <Text style={[style.ttime, style.pv10, style.ph20]}>{message}</Text>;
}

function STTTranscriptTable() {
  const {
    status,
    stts,
    pagination,
    error,
    currentPage,
    setCurrentPage,
    deleteTranscript,
  } = useFetchSTTTranscript();

  // id of STT transcript to delete
  const [sttIdToDelete, setSTTIdToDelete] = React.useState<string | undefined>(
    undefined,
  );

  // message for any download‐error popup
  const [downloadError, setDownloadError] = React.useState<
    string | undefined
  >();

  if (status === 'rejected') {
    return <ErrorTranscriptState message={error?.message} />;
  }

  const onDeleteSTTRecord = async () => {
    try {
      await deleteTranscript(sttIdToDelete!);
    } catch (err: any) {
      setDownloadError(err.message);
    } finally {
      setSTTIdToDelete(undefined);
    }
  };

  return (
    <>
      <View style={style.ttable}>
        <TableHeader columns={headers} />
        <TableBody
          status={status}
          items={stts}
          loadingComponent={
            <Loading background="transparent" text="Fetching transcripts.." />
          }
          renderRow={item => (
            <STTItemRow
              key={item.id}
              item={item}
              onDeleteAction={id => {
                setSTTIdToDelete(id);
              }}
              onDownloadAction={link => {
                downloadS3Link(link).catch((err: Error) => {
                  setDownloadError(err.message || 'Download failed');
                });
              }}
            />
          )}
          emptyComponent={<EmptyTranscriptState />}
        />
        <TableFooter
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pagination={pagination}
        />
      </View>
      {sttIdToDelete && (
        <GenericPopup
          title="Delete ? "
          variant="error"
          message="Are you sure want to delete the transcript ? This action can't be undone."
          visible={!!sttIdToDelete}
          setVisible={() => setSTTIdToDelete(undefined)}
          onConfirm={onDeleteSTTRecord}
          onCancel={() => {
            setSTTIdToDelete(undefined);
          }}
        />
      )}
      {/** DOWNLOAD ERROR POPUP **/}
      {downloadError && (
        <GenericPopup
          title="Download Error"
          variant="error"
          message={downloadError}
          visible={true}
          setVisible={() => setDownloadError(undefined)}
          onConfirm={() => setDownloadError(undefined)}
        />
      )}
    </>
  );
}

export default STTTranscriptTable;
